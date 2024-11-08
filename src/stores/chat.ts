import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { deleteQuestion, postSimilarText, source } from "@/services/chat";
import type { Mode , Chat } from "@/types/chat.d.ts";
import { marked } from "@/utils/marked";
import markdownToTxt from "markdown-to-txt";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "./user";
const userStore = useUserStore();

export const useChatStore = defineStore(
  "chat",
  () => {
    const title = ref("小卫星私域专属大模型");
    const chatMode = ref<Mode>("enhancedAnswer");
    const modeList = ref<
      { label: "相似文本" | "增强回答" | "原始回答"; value: Mode }[]
    >([
      { label: "增强回答", value: "enhancedAnswer" },
      { label: "相似文本", value: "similarText" },
      { label: "原始回答", value: "rawAnswer" },
    ]);
    const chatStatus = ref<"undo" | "doing" | "done">("undo");
    const questionList = ref<Chat[]>([]);
    const currentBase = ref({
      id: "",
      name: "",
      type: "",
    });
    const selectedBases = ref<{
      personal: string[],
      public:string[]
    }>({
      personal: [],
      public:[]
    })
    const topK = ref<number>()
    const topP = ref<number>()
    const temperature = ref<number>()
    const newQuestion = () => {
      questionList.value = [];
    };
    const ws = ref<WebSocket>();
    const getAnswer = async (question: string, mode: Mode, index: number) => {
      if (
        selectedBases.value.personal.length === 0 && selectedBases.value.public.length === 0 && chatMode.value !== "rawAnswer"
      ) {
        ElMessage({
          type: "error",
          message: "尚未选择对话知识库",
          duration: 2000,
        });
        return;
      }
      questionList.value[index][mode].status = "doing";
      chatStatus.value = "doing";
      // console.log(questionList.value[index][mode].status);
      if (mode === "similarText") {
        try {
          const result = await postSimilarText(question);
          questionList.value[index].similarText.text = markdownToTxt(
            result.similar_texts
          );
          questionList.value[index].similarText.content = await marked.parse(
            result.similar_texts
          );
          questionList.value[index].similarText.status = "done";
          chatStatus.value = "done";
        } catch {
          closeQuestion(mode , index);
        }
        return;
      }
      if (mode === "enhancedAnswer") {
        ws.value = new WebSocket(
          "ws://101.132.27.195:9873/model/muti/enhance_socket"
        );
      } else if (mode === "rawAnswer") {
        ws.value = new WebSocket(
          "ws://101.132.27.195:9873/model/raw_socket"
        );
      }
      const sendMessage = () => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
          // ws.value.send(
          //   `{ 
          //     "query":"${question}",
          //     "account":"${userStore.user.account}",
          //     "pid":"${currentBase.value!.id}",
          //     "type":"${currentBase.value!.type}"
          //   }`
          // );
          ws.value.send(
            JSON.stringify({
              query: question,
              account: userStore.user.account,
              personal: selectedBases.value.personal,
              public: selectedBases.value.public,
              top_k: topK.value,
              top_p: topP.value,
              temperature: temperature.value,
            })
          );
        } else {
          console.error("WebSocket is not connected");
        }
      };
      ws.value!.onopen = (event: any) => {
        console.log("WebSocket connection opened:", event);
        sendMessage();
      };
      ws.value!.onmessage = async (event: any) => {
        // console.log("WebSocket message received:", event.data);
        if (event.data === JSON.stringify({ ans: "DONE" })) {
          questionList.value[index][mode].status = "done";
          chatStatus.value = "done";
          return;
        }
        questionList.value[index][mode].text = markdownToTxt(event.data);
        questionList.value[index][mode].content = await marked.parse(event.data);
      };
      ws.value!.onerror = (event: any) => {
        console.error("WebSocket error:", event);
        closeQuestion(mode , index)
      };
      ws.value!.onclose = (event: any) => {
        console.log("WebSocket connection closed:", event);
      };
    };
    //关闭对话
    const closeQuestion = (
      mode: "similarText" | "enhancedAnswer" | "rawAnswer",
      index: number
    ) => {
      console.log("停止生成");
      questionList.value[index][mode].status = "undo";
      chatStatus.value = "undo";
      if (mode === "similarText") {
        source.cancel("similarText closed");
      } else {
        ws.value!.close();
      }
    };
    //重新提问
    const reQuestion = (question: string, mode: Mode, index: number) => {
      if (chatStatus.value === "doing") return;
      questionList.value[index][mode].content = "";
      getAnswer(question, mode, index);
    };
    return {
      title,
      ws,
      currentBase,
      selectedBases,
      topK,
      topP,
      temperature,
      chatMode,
      chatStatus,
      modeList,
      questionList,
      newQuestion,
      closeQuestion,
      getAnswer,
      reQuestion,
    };
  }
);