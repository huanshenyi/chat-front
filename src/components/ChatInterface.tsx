"use client";

import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initializeAWSClient = () => {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-1";
  const credentials = {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    sessionToken: process.env.NEXT_PUBLIC_AWS_SESSION_TOKEN as string,
  };
  return new BedrockAgentRuntimeClient({
    region: region,
    credentials: credentials,
  });
};
export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const addMessage = (role: string, content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    addMessage("user", input);

    try {
      const client = initializeAWSClient();
      const sessionId = Date.now().toString();
      const command = new InvokeAgentCommand({
        agentId: process.env.NEXT_PUBLIC_AWS_AGENTID,
        agentAliasId: process.env.NEXT_PUBLIC_AWS_AGENT_ALIASID,
        sessionId,
        inputText: input,
      });

      // ベドロックエージェントの呼び出し
      const response = await client.send(command);
      let completion = "";

      if (response.completion) {
        for await (const chunkEvent of response.completion) {
          const chunk = chunkEvent.chunk;
          if (chunk !== undefined) {
            const decodedResponse = new TextDecoder("utf-8").decode(
              chunk.bytes
            );
            completion += decodedResponse;
          }
        }
      }

      addMessage("assistant", completion);
    } catch (error) {
      console.error("Error calling Bedrock Agent:", error);
      addMessage("assistant", "エラーが発生しました。");
    } finally {
      setLoading(false);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => {
          return (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "text-primary-foreground bg-[#0f60c4cc]"
                  : "bg-secondary"
              }`}
            >
              {message.content}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        {loading && <p>読み込み中...</p>}
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="聞きたいことを入力してください..."
          className="flex-1"
        />
        <div className="flex flex-col space-y-2">
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="bg-[#0f60c4cc]"
          >
            メッセージ送信
          </Button>
          <Button type="button" variant="secondary">
            データ保存
          </Button>
        </div>
      </form>
    </div>
  );
}
