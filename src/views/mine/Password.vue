<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="password">
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
    >
      <n-form-item
        path="password"
        label="密码"
      >
        <n-input
          v-model:value="model.password"
          type="password"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item
        ref="confirmPassword"
        first
        path="confirmPassword"
        label="重复密码"
      >
        <n-input
          v-model:value="model.confirmPassword"
          :disabled="!model.password"
          type="password"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-row :gutter="[0, 24]">
        <n-col :span="24">
          <div style="display: flex; justify-content: flex-end">
            <n-button
              round
              type="primary"
              @click="handleValidateClick"
            >
              确认
            </n-button>
          </div>
        </n-col>
      </n-row>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FormInst } from "naive-ui";
import { updatePassowrd } from "@/http/User";
import { useRouter } from "vue-router";

const $router = useRouter();
const formRef = ref<FormInst | null>(null);
const model = ref({
  password: "",
  confirmPassword: ""
});
const rules = ref({
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: ["blur"]
    },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符",
      trigger: ["blur"]
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: "请再次输入密码",
      trigger: ["blur"]
    },
    {
      validator: (rule: any, value: string) => {
        if (value !== model.value.password) {
          return new Error("两次输入密码不一致");
        }
        return true;
      },
      trigger: ["blur"]
    }
  ]
});
const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (errors) {
      return;
    }
    updatePassowrd(model.value.password).then(() => {
      $router.back();
    }).catch(err => {
      console.log(err);
    });
  });
};

</script>

<style scoped>
.password {
  width: 300px;
  padding: 20px;
  margin: auto;
  margin-top: 40px;
}
</style>
