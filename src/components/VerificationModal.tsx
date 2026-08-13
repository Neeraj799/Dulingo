import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email?: string;
}

export default function VerificationModal({
  visible,
  onClose,
  email = "alex@gmail.com",
}: VerificationModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Auto-focus when modal becomes visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setCode("");
    onClose();
  };

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(numericText);

    // Automatically navigate when 6th digit is entered
    if (numericText.length === 6) {
      Keyboard.dismiss();
      setTimeout(() => {
        handleClose();
        router.push("/");
      }, 300);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      onShow={() => {
        inputRef.current?.focus();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-[#0D132B]/45 justify-end items-center">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="w-full items-center justify-end"
          >
            <View className="w-full max-w-md bg-white rounded-t-[28px] px-6 pt-5 pb-9 items-center shadow-2xl">
              {/* Top Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="self-end p-1.5 rounded-full bg-[#F3F4F6]"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>

              {/* Title & Description */}
              <View className="items-center mb-6">
                <View className="w-14 h-14 rounded-full bg-[#EEF2FF] justify-center items-center mb-3">
                  <Ionicons name="mail-unread-outline" size={28} color="#6C4EF5" />
                </View>
                <Text className="font-[Poppins-Bold] text-[22px] text-[#0D132B] mb-1.5 text-center">
                  Verify your email
                </Text>
                <Text className="font-[Poppins-Regular] text-[14px] text-[#6B7280] text-center leading-5">
                  We sent a 6-digit verification code to{"\n"}
                  <Text className="font-[Poppins-SemiBold] text-[#0D132B]">
                    {email || "your email address"}
                  </Text>
                </Text>
              </View>

              {/* Code Input Container */}
              <View className="w-full h-[56px] relative mb-6">
                {/* Visual 6-Digit Boxes */}
                <View className="flex-row justify-between w-full h-full px-1" pointerEvents="none">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = code[index] || "";
                    const isFocused =
                      code.length === index ||
                      (code.length === 6 && index === 5);

                    return (
                      <View
                        key={index}
                        className={`w-[46px] h-[54px] rounded-[14px] border-[1.5px] justify-center items-center ${
                          digit
                            ? "border-[#6C4EF5] bg-white"
                            : isFocused
                            ? "border-[#6C4EF5] bg-white shadow-sm shadow-[#6C4EF5]"
                            : "border-[#E5E7EB] bg-[#F9FAFB]"
                        }`}
                      >
                        <Text className="font-[Poppins-Bold] text-[22px] text-[#0D132B]">
                          {digit}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Real Transparent Input layer stretched over entire box area */}
                <TextInput
                  ref={inputRef}
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="absolute top-0 left-0 right-0 bottom-0 w-full h-full opacity-[0.01] z-10 text-[1px] text-transparent"
                  caretHidden={true}
                  autoFocus={true}
                  contextMenuHidden={true}
                />
              </View>

              <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] text-center">
                {"Didn't receive the code? "}
                <Text className="font-[Poppins-SemiBold] text-[#6C4EF5]">
                  Resend
                </Text>
              </Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
