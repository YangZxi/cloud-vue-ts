<template>
  <n-grid
    x-gap="12"
    :cols="12"
    style="text-align: left;"
  >
    <n-gi
      :span="2"
      style="text-align: left"
    >
      <b style="font-size: 20px">本地储存</b>
    </n-gi>
    <n-gi
      :span="4"
      :offset="0"
    >
    <!-- space -->
    </n-gi>
    <!-- 搜索按钮 -->
    <n-gi
      :span="6"
      class="header-r-box"
    >
      <n-input-group>
        <n-select
          label-field="name"
          value-field="id"
          filterable
          :options="searchList"
          :render-tag="searchOption.renderTag"
          :render-label="searchOption.renderLabel"
          :loading="searchOption.loading"
          clearable
          remote
          @search="searchHandler"
        >
          <!-- :show="searchOption.show"
          @focus="searchOption.show = true"
          @blur="searchOption.show = false" -->
          <template #prefix>
            <n-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 512 512"
              >
                <path
                  d="M315.27 33L96 304h128l-31.51 173.23a2.36 2.36 0 0 0 2.33 2.77h0a2.36 2.36 0 0 0 1.89-.95L416 208H288l31.66-173.25a2.45 2.45 0 0 0-2.44-2.75h0a2.42 2.42 0 0 0-1.95 1z"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="32"
                />
              </svg>
            </n-icon>
          </template>
          <template #arrow>
            <transition name="slide-left">
              <c-icon name="user" />
            </transition>
          </template>
        </n-select>
        <n-button
          type="primary"
          ghost
          @click="searchHandler"
        >
          搜索
        </n-button>
      </n-input-group>
      <!-- 消息 -->
      <n-badge
        :value="tips.length"
        dot
      >
        <n-button
          strong
          secondary
          circle
          type="success"
        >
          <template #icon>
            <n-icon>
              <svg
                v-if="tips.length == 0"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 448 512"
              >
                <path
                  d="M439.39 362.29c-19.32-20.76-55.47-51.99-55.47-154.29c0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29c-6 6.45-8.66 14.16-8.61 21.71c.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32c.05-7.55-2.61-15.27-8.61-21.71zM67.53 368c21.22-27.97 44.42-74.33 44.53-159.42c0-.2-.06-.38-.06-.58c0-61.86 50.14-112 112-112s112 50.14 112 112c0 .2-.06.38-.06.58c.11 85.1 23.31 131.46 44.53 159.42H67.53zM224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64z"
                  fill="currentColor"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6" />
                  <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                  <path d="M21 6.727A11.05 11.05 0 0 0 18.206 3" />
                  <path d="M3 6.727A11.05 11.05 0 0 1 5.792 3" />
                </g>
              </svg>
            </n-icon>
          </template>
        </n-button>
      </n-badge>
      <!-- 头像 -->
      <div class="avatar-box">
        <n-popselect
          v-model:value="popselect.value"
          :options="popselect.options"
          trigger="click"
          @update:value="popselect.popselectHanlder"
        >
          <n-avatar
            style="position: absolute;cursor: pointer;"
            round
            :size="50"
            src="http://q2.qlogo.cn/headimg_dl?dst_uin=1282381264&spec=3"
          />
        </n-popselect>
      </div>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { reactive, ref, h, VNodeChild } from "vue";
import { useRouter } from "vue-router";
import { user } from "@/store/user";
import { search as searchAPI } from "@/http/Explore";
import useStore from "@/store/temp";
import { Resource } from "@/type/type";
import { NIcon } from "naive-ui";
import { fileIcon } from "@/components/file-table/common.js";
import SearchLabel from "./SearchLabel.vue";

const $store = useStore();

const tips = reactive([{ a: "123" }]);
const $router = useRouter();

const searchList = ref<Resource[]>([]);
const searchOption = reactive({
  show: false,
  loading: false,
  renderLabel: (option: Resource): VNodeChild => {
    // console.log(option.type);
    return h(SearchLabel, {
      resource: option,
      onClick: () => {
        let path = option.path;
        if (option.type === "dir") {
          path += "/" + option.name;
        }
        $router.push({
          name: "Explorer",
          params: {
            name: "local"
          },
          query: {
            path,
            fileId: option.id
          }
        });
      }
    }, () => h(fileIcon(option.type)));
  },
  renderTag: ({ option }) => {
    return h("span", null, [fileIcon(option.type), option.name]);
  }
});
let timer: number | null = null;
function searchHandler(word: String) {
  if (!word) {
    return;
  }
  if (!$store.bucket) {
    window.$message.info("请先选择仓库");
    return;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    searchAPI({
      name: word,
      bucketName: $store.bucket?.name
    }).then(res => {
      searchList.value = res;
      searchOption.show = true;
    });
  }, 700);
}

// const explorePath =
const popselect = reactive({
  value: "",
  options: [
    {
      label: "修改密码",
      value: "Password"
    },
    {
      label: "我的分享",
      value: "ShareList"
    },
    {
      label: "退出登录",
      value: "Logout"
    }
  ],
  popselectHanlder: (val: string) => {
    switch (val) {
      case "Password":
        $router.push({
          name: "Password"
        });
        break;
      case "ShareList":
        $router.push({
          name: "ShareList"
        });
        break;
      case "Logout":
        user().logout();
        $router.push({
          name: "Login",
          params: {
            // msg: data.msg
          }
        });
        break;
    }
  }
});

</script>

<style scoped>
.header-r-box {
  display: flex;
  justify-content: end;
  padding: 0 20px;
  column-gap: 20px;
}

.avatar-box {
  position: relative;
  width: 50px;
  min-width: 50px;
  top: -10px;
}
</style>

<style>
.n-base-select-option__content {
  width: 100%;
}
</style>
