import { useSignUp, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants/images";
import VerificationModal from "../components/VerificationModal";

const getErrorMessage = (error: unknown): string => {
  if (!error) return "An error occurred";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const err = error as Record<string, any>;
    if (err.longMessage) return String(err.longMessage);
    if (err.message) return String(err.message);
    if (Array.isArray(err.errors) && err.errors[0]) {
      return err.errors[0].longMessage || err.errors[0].message || "Sign up error";
    }
  }
  return "An unexpected error occurred";
};

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || isLoading || fetchStatus === "fetching") return;
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });

      if (error) {
        setErrorMessage(getErrorMessage(error));
        setIsLoading(false);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMessage(getErrorMessage(sendError));
        setIsLoading(false);
        return;
      }

      setIsModalVisible(true);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        return { success: false, error: getErrorMessage(error) };
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.replace(url as any);
            }
          },
        });
        return { success: true };
      }

      return { success: false, error: "Verification incomplete." };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  };

  const handleResendCode = async () => {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_apple") => {
    try {
      setErrorMessage("");
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="max-w-md w-full self-center flex-1 justify-between">
          {/* Top Bar: Back Button */}
          <View className="flex-row items-center pt-1 pb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
            >
              <Ionicons name="chevron-back" size={24} color="#0D132B" />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View className="mt-2 mb-4">
            <Text className="font-[Poppins-Bold] text-[28px] text-[#0D132B] leading-tight">
              Create your account
            </Text>
            <Text className="font-[Poppins-Regular] text-[15px] text-[#6B7280] mt-1.5">
              Start your language journey today ✨
            </Text>
          </View>

          {/* Center Mascot Image */}
          <View className="items-center justify-center my-2 h-[150px]">
            <Image
              source={images.mascotAuth}
              className="w-[190px] h-[140px]"
              resizeMode="contain"
            />
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="font-[Poppins-Medium] text-[13px] text-[#EF4444] text-center my-1">
              {errorMessage}
            </Text>
          ) : null}

          {/* Form Fields */}
          <View className="gap-3.5 my-2">
            {/* Email Field */}
            <View className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-2.5 shadow-sm">
              <Text className="font-[Poppins-Medium] text-[12px] text-[#9CA3AF]">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="alex@gmail.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="font-[Poppins-Regular] text-[15px] text-[#0D132B] p-0 mt-0.5"
              />
            </View>

            {/* Password Field */}
            <View className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-2.5 shadow-sm flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="font-[Poppins-Medium] text-[12px] text-[#9CA3AF]">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="•••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="font-[Poppins-Regular] text-[15px] text-[#0D132B] p-0 mt-0.5"
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                className="p-1"
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSignUp}
            disabled={isLoading || fetchStatus === "fetching"}
            className="bg-[#6C4EF5] rounded-2xl h-[56px] items-center justify-center mt-3 mb-5 shadow-md shadow-[#6C4EF5]"
          >
            {isLoading || fetchStatus === "fetching" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-[Poppins-SemiBold] text-[17px]">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-3">
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
            <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] px-4">
              or continue with
            </Text>
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
          </View>

          {/* Social Auth Buttons */}
          <View className="gap-3 my-2">
            {/* Google */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSocialAuth("oauth_google")}
              className="bg-white border border-[#E5E7EB] rounded-2xl h-[52px] flex-row items-center justify-center px-4"
            >
              <View className="mr-2.5">
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </View>
              <Text className="font-[Poppins-Medium] text-[15px] text-[#0D132B]">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSocialAuth("oauth_facebook")}
              className="bg-white border border-[#E5E7EB] rounded-2xl h-[52px] flex-row items-center justify-center px-4"
            >
              <View className="mr-2.5">
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </View>
              <Text className="font-[Poppins-Medium] text-[15px] text-[#0D132B]">
                Continue with Facebook
              </Text>
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSocialAuth("oauth_apple")}
              className="bg-white border border-[#E5E7EB] rounded-2xl h-[52px] flex-row items-center justify-center px-4"
            >
              <View className="mr-2.5">
                <Ionicons name="logo-apple" size={22} color="#000000" />
              </View>
              <Text className="font-[Poppins-Medium] text-[15px] text-[#0D132B]">
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center mt-6 mb-2">
            <Text className="font-[Poppins-Regular] text-[14px] text-[#6B7280]">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              activeOpacity={0.7}
            >
              <Text className="font-[Poppins-SemiBold] text-[14px] text-[#6C4EF5]">
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Required mount point for Clerk Turnstile bot protection - must be visible */}
        <View nativeID="clerk-captcha" style={{ width: "100%", minHeight: 65 }} />
      </ScrollView>

      {/* 6-Digit Email Verification Modal */}
      <VerificationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        email={email}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
      />
    </SafeAreaView>
  );
}
