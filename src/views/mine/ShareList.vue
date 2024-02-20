<template>
  <div>
    <div>
      <n-button
        ghost
        color="#ff69b4"
        @click="$router.back()"
      >
        <template #icon>
          <c-icon name="fa-arrow-left" />
        </template>
        返回
      </n-button>
    </div>

    <div class="share-list">
      <n-table
        :bordered="false"
        :single-line="false"
        style="width: 1200px"
      >
        <thead>
          <tr>
            <th>分享文件</th>
            <th style="width: 70px">
              短链接
            </th>
            <th style="width: 100px">
              统计数据
            </th>
            <th style="width: 170px">
              过期时间
            </th>
            <th style="width: 200px">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="el in shareList"
            :key="el.autoId"
          >
            <td style="text-align: left">
              {{ el.shareLabel }}
            </td>
            <td>{{ el.shortCode || "无" }}</td>
            <td>
              <n-tag
                :bordered="false"
                type="info"
                size="small"
              >
                浏览: {{ el.viewCount }}
              </n-tag>
              <br>
              <n-tag
                :bordered="false"
                type="error"
                size="small"
              >
                下载: {{ el.downloadCount }}
              </n-tag>
            </td>
            <td>
              {{ el.deadline ? new Date(el.deadline).format() : "永不过期" }}
            </td>
            <td class="share-list-operation">
              <n-button
                type="primary"
                size="small"
                @click="copyLink(el.id)"
              >
                链接
              </n-button>
              <n-button
                type="primary"
                size="small"
                @click="showQRCode(el.id)"
              >
                二维码
              </n-button>
              <n-button
                type="primary"
                size="small"
                @click="deleteShare(el.autoId)"
              >
                删除
              </n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>

    <n-modal
      v-model:show="shareDialog.visible"
      preset="dialog"
      title="二维码"
      :show-icon="false"
    >
      <div style="text-align: center">
        <vue-qrcode
          :value="shareDialog.url"
          :size="200"
        />
      </div>
      <template #action>
        <n-button
          size="small"
          color="#ff69b4"
          @click="shareDialog.visible = false"
        >
          好的
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { copyText } from "@/utils/Tools";
import {
  listShare as listShareApi,
  deleteShare as deleteShareApi
} from "@/http/Share";
import { shareDialog, shareHandler } from "@/views/explorer";
import VueQrcode from "@chenfengyuan/vue-qrcode";

const $router = useRouter();

const shareList = ref([]);
const shareDialog = reactive({
  visible: false,
  url: "",
});
onMounted(() => {
  listShare();
});

function listShare() {
  listShareApi().then((data) => {
    shareList.value = data;
  });
}

async function copyLink(id: string) {
  const url = window.location.origin + "/public/share/" + id;
  await copyText(url);
  window.$message.success("复制成功");
}

function showQRCode(id: string) {
  shareDialog.url = window.location.origin + "/public/share/" + id;
  shareDialog.visible = true;
}

function deleteShare(id: number) {
  deleteShareApi(id).then(() => {
    window.$message.success("删除成功");
    listShare();
  });
}
</script>

<style scoped lang="scss">
.share-list {
  display: flex;
  justify-content: center;

  .statistics {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  table td,
  table th {
    text-align: center;
  }
}
.share-list-operation {
  button {
    margin: 0 5px;
  }
}
</style>
