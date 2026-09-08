import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# ── Early Network & SFU Connectivity Patches (Must execute before getstream import) ──
logger = logging.getLogger("vision_agents.teacher")
try:
    # 1. Fix SSL handshake timeout bug in websocket-client on Python 3.14 on Windows
    import websocket._http
    _orig_sni = websocket._http._wrap_sni_socket
    def _patched_wrap_sni(sock, sslopt, hostname, check_hostname):
        sock.settimeout(None)
        res = _orig_sni(sock, sslopt, hostname, check_hostname)
        res.settimeout(10.0)
        return res
    websocket._http._wrap_sni_socket = _patched_wrap_sni

    # 2. Force location routing to 'IAD' (US East - sfu-oci-us-east-vp2)
    from getstream.video.rtc import connection_utils, connection_manager
    _orig_join_call = connection_utils.join_call

    async def _patched_join_call(call, user_id, location, create, local_sfu, **kwargs):
        return await _orig_join_call(call, user_id, "IAD", create, local_sfu, **kwargs)

    connection_utils.join_call = _patched_join_call
    connection_manager.join_call = _patched_join_call
    logger.info("Configured Stream edge routing location to 'IAD' and patched SSL handshake for reliable connectivity")
except Exception as patch_err:
    logger.warning(f"Could not patch join_call location / SSL: {patch_err}")

from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.plugins import getstream, gemini, openai

# Load environment variables from vision-agent/.env and parent ../.env
service_dir = Path(__file__).resolve().parent
local_env = service_dir / ".env"
parent_env = service_dir.parent / ".env"

if local_env.exists():
    load_dotenv(local_env, override=True)
if parent_env.exists():
    load_dotenv(parent_env, override=False)


DEFAULT_TEACHER_INSTRUCTIONS = (
    "You're a warm, energetic, real-world language teacher having a friendly 1-on-1 spoken lesson with your student. "
    "Act like an encouraging, human language teacher for the current lesson only. "
    "Stay strictly within this lesson's goal, vocabulary, phrases, and context—never teach unrelated topics or switch to other languages. "
    "Speak mostly in English. Introduce target-language words slowly, immediately followed by their English translation. "
    "Use short, natural sentences with contractions like I'm, let's, you're, that's, we'll, don't. "
    "Keep every reply to just one or two conversational sentences. "
    "Listen carefully to your student's response, adapt your next explanation to how they did, offer gentle encouragement, and ask them to repeat or try again."
)


def build_dynamic_teacher_instructions(custom_data: dict) -> str:
    """Build dynamic teacher instructions from call custom metadata."""
    lesson_title = custom_data.get("lessonTitle", "Language Practice Session")
    language_name = custom_data.get("languageName") or custom_data.get("languageCode", "the target language")
    goal = custom_data.get("goal")
    vocabulary = custom_data.get("vocabulary") or []
    phrases = custom_data.get("phrases") or []
    ai_prompt_data = custom_data.get("aiTeacherPrompt") or {}

    prompt_parts = [
        f"You're a warm, energetic, real-world language teacher having a 1-on-1 spoken lesson with your student.",
        f"Today's lesson: '{lesson_title}' — you are teaching ONLY {language_name}.",
        f"IMPORTANT: Act like a real-world language teacher for {language_name} and this lesson ONLY. Stay strictly within this lesson's goal, vocabulary, phrases, and context. Never teach unrelated topics or switch to other languages.",
    ]

    if goal and isinstance(goal, dict) and goal.get("description"):
        prompt_parts.append(f"Your goal for this lesson: {goal.get('description')}. Stick strictly to this—don't teach anything outside it.")

    if ai_prompt_data and isinstance(ai_prompt_data, dict) and ai_prompt_data.get("systemPrompt"):
        prompt_parts.append(f"Your persona and lesson focus: {ai_prompt_data.get('systemPrompt')}")
    else:
        prompt_parts.append(DEFAULT_TEACHER_INSTRUCTIONS)

    if vocabulary and isinstance(vocabulary, list) and len(vocabulary) > 0:
        vocab_items = []
        for v in vocabulary:
            if isinstance(v, dict):
                word = v.get("word", "")
                trans = v.get("translation", "")
                pron = v.get("pronunciation", "")
                if word:
                    item_text = f"'{word}' ({trans})"
                    if pron:
                        item_text += f" [pronounced: {pron}]"
                    vocab_items.append(item_text)
        if vocab_items:
            prompt_parts.append(f"Lesson Vocabulary to teach & practice: {', '.join(vocab_items)}.")

    if phrases and isinstance(phrases, list) and len(phrases) > 0:
        phrase_items = []
        for p in phrases:
            if isinstance(p, dict):
                phrase = p.get("phrase", "")
                trans = p.get("translation", "")
                if phrase:
                    phrase_items.append(f"'{phrase}' ({trans})")
        if phrase_items:
            prompt_parts.append(f"Lesson Phrases to practice: {', '.join(phrase_items)}.")

    if ai_prompt_data and isinstance(ai_prompt_data, dict) and ai_prompt_data.get("topics"):
        topics = ai_prompt_data.get("topics")
        if isinstance(topics, list):
            prompt_parts.append(f"Core Topics: {', '.join(topics)}.")

    prompt_parts.append(
        "HOW YOU MUST SPEAK (NON-NEGOTIABLE):\n"
        "- Be warm, human, energetic, and lesson-focused instead of robotic—like a favorite real-world language teacher.\n"
        "- Speak mostly in English. Introduce target-language words slowly and immediately provide their English translation.\n"
        "- Use short, natural sentences with contractions like I'm, let's, you're, that's, we'll, don't, can't, won't.\n"
        "- Keep every reply strictly to ONE or TWO conversational sentences. No long lectures or paragraphs.\n"
        "- Stay strictly within this lesson's goal, vocabulary, and phrases. Never go off-topic or switch languages.\n"
        "- Listen to the student's response carefully and adapt your next explanation accordingly.\n"
        "- Provide gentle encouragement and exciting praise for good tries ('Love it!', 'You're getting it!', 'So close, let's try once more!').\n"
        "- Always end your turn by asking the student to repeat a word or try again."
    )

    return "\n\n".join(prompt_parts)


async def create_agent(**kwargs) -> Agent:
    """Factory function to build a new Agent instance for each session."""
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if (
        gemini_key
        and gemini_key not in ("your_gemini_api_key_here", "your_google_api_key_here")
        and not gemini_key.startswith("your_")
    ):
        logger.info("Using Gemini Realtime LLM for AI Language Teacher")
        llm = gemini.Realtime(api_key=gemini_key)
    elif openai_key and not openai_key.startswith("sk-proj-placeholder"):
        logger.info("Using OpenAI Realtime LLM for AI Language Teacher")
        llm = openai.Realtime(send_video=False)
    else:
        logger.info("Defaulting to Gemini Realtime LLM for AI Language Teacher")
        llm = gemini.Realtime()

    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="AI Language Teacher", id="language_teacher_agent"),
        instructions=DEFAULT_TEACHER_INSTRUCTIONS,
        llm=llm,
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    """Call lifecycle handler when joining a Stream call session."""
    call = await agent.create_call(call_type, call_id)

    # Make sure agent goes live in audio_room
    try:
        await call.go_live()
    except Exception as exc:
        logger.debug(f"go_live notice: {exc}")

    # Fetch call details to extract custom metadata packed by server
    opening_message = "Hey there! I'm your teacher, and I'm so excited to practice with you today! Let's dive right in."
    try:
        call_info = await call.get()
        if call_info and hasattr(call_info, "call") and call_info.call and hasattr(call_info.call, "custom"):
            custom_data = call_info.call.custom or {}
            dynamic_instructions = build_dynamic_teacher_instructions(custom_data)
            agent.instructions = dynamic_instructions

            ai_prompt_data = custom_data.get("aiTeacherPrompt") or {}
            if isinstance(ai_prompt_data, dict) and ai_prompt_data.get("openingMessage"):
                opening_message = ai_prompt_data.get("openingMessage")
            elif custom_data.get("lessonTitle"):
                opening_message = f"Hey! Welcome to '{custom_data.get('lessonTitle')}'—I'm so glad you're here! Let's get started."
    except Exception as err:
        logger.warning(f"Could not read custom call metadata: {err}")

    # ── Realtime Live Caption Event Queue & Broadcaster ─────────────────
    import asyncio
    import time
    caption_queue: asyncio.Queue = asyncio.Queue()

    async def broadcast_caption_worker():
        while True:
            item = await caption_queue.get()
            if item is None:
                break
            try:
                # 1. Broadcast via custom call event for mobile UI
                if hasattr(call, "send_call_event"):
                    await call.send_call_event(custom=item)
                # 2. Also send as closed caption if SDK method is present
                if hasattr(call, "send_closed_caption"):
                    try:
                        await call.send_closed_caption(
                            text=item.get("text", ""),
                            speaker_id=item.get("speaker_id", "teacher"),
                        )
                    except Exception as cc_err:
                        logger.debug(f"send_closed_caption notice: {cc_err}")
            except Exception as broadcast_err:
                logger.debug(f"Caption broadcast error: {broadcast_err}")
            finally:
                caption_queue.task_done()

    caption_worker_task = asyncio.create_task(broadcast_caption_worker())

    def queue_caption(speaker: str, speaker_name: str, text: str, mode: str = "final"):
        clean_text = text.strip()
        if not clean_text:
            return
        caption_item = {
            "type": "caption",
            "speaker": speaker,
            "speaker_id": "teacher" if speaker == "teacher" else "learner",
            "speakerName": speaker_name,
            "text": clean_text,
            "mode": mode,
            "timestamp": time.time(),
        }
        caption_queue.put_nowait(caption_item)

    # Attach speech transcription interceptors on Realtime LLM
    if hasattr(agent, "llm") and agent.llm:
        original_emit_agent = getattr(agent.llm, "_emit_agent_speech_transcription", None)
        original_emit_user = getattr(agent.llm, "_emit_user_speech_transcription", None)

        def hooked_emit_agent(*args, **kwargs):
            text = ""
            mode = "final"
            if args:
                text = str(args[0])
                if len(args) > 1:
                    mode = str(args[1])
            if "text" in kwargs:
                text = str(kwargs["text"])
            if "mode" in kwargs:
                mode = str(kwargs["mode"])

            try:
                queue_caption("teacher", "AI Teacher", text, mode)
            except Exception as hook_err:
                logger.debug(f"Agent caption hook notice: {hook_err}")

            if callable(original_emit_agent):
                try:
                    return original_emit_agent(*args, **kwargs)
                except TypeError:
                    try:
                        return original_emit_agent(text, mode=mode)
                    except Exception as emit_err:
                        logger.debug(f"Original agent transcription emit notice: {emit_err}")
                except Exception as emit_err:
                    logger.debug(f"Original agent transcription emit notice: {emit_err}")

        def hooked_emit_user(*args, **kwargs):
            text = ""
            mode = "final"
            if args:
                text = str(args[0])
                if len(args) > 1:
                    mode = str(args[1])
            if "text" in kwargs:
                text = str(kwargs["text"])
            if "mode" in kwargs:
                mode = str(kwargs["mode"])

            try:
                queue_caption("user", "You", text, mode)
            except Exception as hook_err:
                logger.debug(f"User caption hook notice: {hook_err}")

            if callable(original_emit_user):
                try:
                    return original_emit_user(*args, **kwargs)
                except TypeError:
                    try:
                        return original_emit_user(text, mode=mode)
                    except Exception as emit_err:
                        logger.debug(f"Original user transcription emit notice: {emit_err}")
                except Exception as emit_err:
                    logger.debug(f"Original user transcription emit notice: {emit_err}")

        try:
            agent.llm._emit_agent_speech_transcription = hooked_emit_agent
            agent.llm._emit_user_speech_transcription = hooked_emit_user
        except Exception as patch_err:
            logger.debug(f"Could not hook LLM transcription emitters: {patch_err}")

    try:
        async with agent.join(call):
            # Send initial greeting caption immediately
            queue_caption("teacher", "AI Teacher", opening_message, "final")
            await agent.simple_response(text=opening_message)
            await agent.finish()
    except Exception as err:
        logger.error(f"Agent session error: {err}")
    finally:
        caption_queue.put_nowait(None)
        await caption_worker_task


runner = Runner(AgentLauncher(create_agent=create_agent, join_call=join_call))


if __name__ == "__main__":
    runner.cli()

