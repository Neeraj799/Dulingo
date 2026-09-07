import os
import logging
from pathlib import Path
from dotenv import load_dotenv
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

logger = logging.getLogger("vision_agents.teacher")

DEFAULT_TEACHER_INSTRUCTIONS = (
    "You are an encouraging, friendly, and patient AI language teacher in an interactive language learning app. "
    "By default, you speak in English to guide, teach, explain vocabulary, and practice conversation. "
    "You teach the student their selected target language through clear English explanations, gentle feedback, "
    "pronunciation tips, and interactive practice exercises. "
    "Keep your spoken responses concise, natural, friendly, and appropriate for real-time voice conversation."
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
        "You are an encouraging, friendly, and patient AI language teacher conducting a live voice lesson.",
        f"Target Language to teach: {language_name}.",
        f"Lesson Title: {lesson_title}.",
    ]

    if goal and isinstance(goal, dict) and goal.get("description"):
        prompt_parts.append(f"Lesson Goal: {goal.get('description')}")

    if ai_prompt_data and isinstance(ai_prompt_data, dict) and ai_prompt_data.get("systemPrompt"):
        prompt_parts.append(f"Teacher Role & Persona Instructions: {ai_prompt_data.get('systemPrompt')}")
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
                    vocab_items.append(f"'{word}' ({trans}, pronounced: {pron})")
        if vocab_items:
            prompt_parts.append(f"Key Vocabulary to cover & practice: {', '.join(vocab_items)}.")

    if phrases and isinstance(phrases, list) and len(phrases) > 0:
        phrase_items = []
        for p in phrases:
            if isinstance(p, dict):
                phrase = p.get("phrase", "")
                trans = p.get("translation", "")
                if phrase:
                    phrase_items.append(f"'{phrase}' ({trans})")
        if phrase_items:
            prompt_parts.append(f"Key Phrases to practice: {', '.join(phrase_items)}.")

    if ai_prompt_data and isinstance(ai_prompt_data, dict) and ai_prompt_data.get("topics"):
        topics = ai_prompt_data.get("topics")
        if isinstance(topics, list):
            prompt_parts.append(f"Topics to explore: {', '.join(topics)}.")

    prompt_parts.append(
        "Important Guidelines: Keep spoken responses concise (1-3 sentences per turn) so the conversation flows smoothly. "
        "Engage the learner, ask questions, encourage their speaking, and give gentle feedback."
    )

    return "\n\n".join(prompt_parts)


async def create_agent(**kwargs) -> Agent:
    """Factory function to build a new Agent instance for each session."""
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
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
    opening_message = "Hello! I am your AI language teacher. I'm excited to help you learn! Let's get started!"
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
                opening_message = f"Hello! Welcome to our lesson: '{custom_data.get('lessonTitle')}'. I am your AI language teacher! Ready to begin?"
    except Exception as err:
        logger.warning(f"Could not read custom call metadata: {err}")

    try:
        async with agent.join(call):
            await agent.simple_response(text=opening_message)
            await agent.finish()
    except Exception as err:
        logger.error(f"Agent session error: {err}")


runner = Runner(AgentLauncher(create_agent=create_agent, join_call=join_call))


if __name__ == "__main__":
    runner.cli()

