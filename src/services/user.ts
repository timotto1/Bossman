import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

interface UserMetadata {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
}

const PASSWORD_HISTORY_LIMIT = 5;

export const findUserByEmail = async (
  supabase: SupabaseClient,
  email: string,
) => {
  const { data, error } = await supabase.rpc(`get_user_id_by_email`, {
    p_email: email,
  });

  if (error) throw new Error(error.message);

  return { data: { id: data } };
};

const generateRandomPassword = (length = 16) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join("");
};

export const createUserInSupabase = async (
  supabase: SupabaseClient,
  userMetadata: UserMetadata,
) => {
  const { email, firstName, lastName, phone, company } = userMetadata;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: generateRandomPassword(),
    user_metadata: { firstName, lastName, phoneNumber: phone, company },
  });

  return { data, error };
};

export const createVerificationToken = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const verificationToken = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const { error } = await supabase.from("verification_tokens").insert([
    {
      user_id: userId,
      token: verificationToken,
      expires_at: expiresAt,
    },
  ]);

  return { data: verificationToken, error };
};

export const validateVerificationToken = async (
  supabase: SupabaseClient,
  token: string,
) => {
  const { data, error } = await supabase
    .from("verification_tokens")
    .select("user_id,expires_at,token")
    .eq("token", token)
    .eq("is_used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return { data, error };
};

export const confirmUserEmail = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  return { error };
};

export const updateUserPassword = async (
  supabase: SupabaseClient,
  userId: string,
  password: string,
) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });

  return { data, error };
};

export const markVerificationTokenAsUsed = async (
  supabase: SupabaseClient,
  token: string,
) => {
  const { error } = await supabase
    .from("verification_tokens")
    .update({ is_used: true })
    .eq("token", token);

  return { error };
};

export const checkPasswordHistory = async (
  supabase: SupabaseClient,
  userId: string,
  password: string,
) => {
  const { data: passwordHistory, error } = await supabase
    .from("password_history")
    .select("hashed_password")
    .eq("user_id", userId)
    .limit(PASSWORD_HISTORY_LIMIT)
    .order("created_at", { ascending: true });

  if (passwordHistory) {
    const isInHistory = passwordHistory.some((entry) => {
      return bcrypt.compareSync(password, entry.hashed_password);
    });

    return { data: isInHistory, error };
  }

  return { data: false, error };
};

export const addPasswordToPasswordHistory = async (
  supabase: SupabaseClient,
  userId: string,
  password: string,
) => {
  const passwordHistoriesLength = await getUserPasswordHistoriesLength(
    supabase,
    userId,
  );

  if (passwordHistoriesLength! >= PASSWORD_HISTORY_LIMIT) {
    await deleteOldestPasswordFromPasswordHistory(supabase, userId);
  }

  const { data, error } = await supabase.from("password_history").insert([
    {
      user_id: userId,
      hashed_password: await bcrypt.hash(password, 10),
    },
  ]);

  return { data, error };
};

export const getRoleID = async (supabase: SupabaseClient, name: string) => {
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data?.id;
};

export const createUserRole = async (
  supabase: SupabaseClient,
  userID: string,
  roleID: string,
) => {
  const { error } = await supabase.from("user_roles").insert({
    user_id: userID,
    role_id: roleID,
  });

  return { error };
};

const deleteOldestPasswordFromPasswordHistory = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  await supabase
    .from("password_history")
    .delete()
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);
};

const getUserPasswordHistoriesLength = async (
  supabase: SupabaseClient,
  userId: string,
) => {
  const { data } = await supabase
    .from("password_history")
    .select("*")
    .eq("user_id", userId);

  return data?.length;
};
