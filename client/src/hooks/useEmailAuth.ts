import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useEmailAuth() {
  const { data: emailUser, isLoading, refetch } = trpc.emailAuth.me.useQuery();
  const loginMutation = trpc.emailAuth.login.useMutation();
  const logoutMutation = trpc.emailAuth.logout.useMutation();
  const registerMutation = trpc.emailAuth.register.useMutation();
  const [, navigate] = useLocation();

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    await refetch();
    return result;
  };

  const register = async (
    email: string,
    password: string,
    nickname: string,
    realName?: string,
    company?: string,
    phone?: string,
  ) => {
    const result = await registerMutation.mutateAsync({
      email,
      password,
      nickname,
      realName: realName || undefined,
      company: company || undefined,
      phone: phone || undefined,
    });
    return result;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    await refetch();
    navigate("/");
  };

  return {
    emailUser,
    isLoading,
    isLoggedIn: !!emailUser,
    isApproved: emailUser?.status === "approved",
    isAdmin: emailUser?.role === "admin",
    isPending: emailUser?.status === "pending",
    isRejected: emailUser?.status === "rejected",
    login,
    register,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
}
