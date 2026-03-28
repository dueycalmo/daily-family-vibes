import { supabase } from "@/integrations/supabase/client";

interface AnthropicResponse {
  content: { type: string; text: string }[];
  model: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function askClaude(
  prompt: string,
  options?: { systemPrompt?: string; maxTokens?: number }
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("chat-anthropic", {
    body: {
      prompt,
      systemPrompt: options?.systemPrompt,
      maxTokens: options?.maxTokens,
    },
  });

  if (error) throw new Error(error.message ?? "Failed to call Anthropic");
  if (data?.error) throw new Error(data.error);

  const textBlock = (data as AnthropicResponse).content?.find(
    (b) => b.type === "text"
  );
  return textBlock?.text ?? "";
}
