<template>
  <div
    v-if="shareData !== null"
    class="share-page"
  >
    <div style="width: 960px;margin: auto;">
      <div class="share-header">
        <span>过期时间：{{ shareData.deadline ? new Date(shareData.deadline) : "永久" }}</span>
      </div>
      <div v-if="shareData.resourceList.length === 0">
        <n-empty description="你什么也找不到">
          <template #extra>
            <n-button size="small">
              看看别的
            </n-button>
          </template>
        </n-empty>
      </div>
      <div v-else-if="shareData.resourceList.length === 1">
        <n-card :title="shareData.resourceList[0].name">
          <template #header-extra>
            <n-button
              type="primary"
              dashed
              size="small"
              @click="API.download(shareData.resourceList[0].id, explorerPath.join('/'))"
            >
              下载
            </n-button>
          </template>
          <Preview
            :api="API.preview"
            :resource="shareData.resourceList[0]"
            style="height: 550px;"
          />
        </n-card>
      </div>
      <div
        v-else
        class="resource-list"
      >
        <div class="resource-list">
          <FilePath
            name="Share"
            :path="explorerPath"
            :click-bread="intoPath"
          />
          <n-data-table
            :bordered="false"
            :row-key="(row) => (row.id ? row.id : row.name)"
            :columns="columns"
            :data="shareData.resourceList"
            @update:checked-row-keys="handleCheck"
          />
        </div>
      </div>
    </div>
  </div>
  <PassInput
    v-else-if="showPwd"
    :id="id"
    :pass-ok="() => list()"
  />
</template>

<script setup>
import PassInput from "@/components/PassInput.vue";
import FilePath from "@/components/ExplorerToolBar/FilePath.vue";
import { h, onMounted, readonly, ref } from "vue";
import { useRoute } from "vue-router";
import { sharePinia } from "@/store/share";
import API from "@/http/Share";
import { NButton } from "naive-ui";
import { fileIcon } from "@/components/file-table/common.js";
import Preview from "@/components/file-preview/Preview.vue";

const $route = useRoute();
const id = ref($route.params.id);
const shareData = ref(null);
/* 面包屑 */
const explorerPath = ref([]);
const showPwd = ref(false);
/* 面包屑 END */

onMounted(() => {
  window.$loadingBar.start();
  // list().then(() => window.$loadingBar.finish()).catch(() => window.$loadingBar.error());
  API.pass(id.value, null).then(() => {
    getShareInfo();
  }).catch(() => {
    showPwd.value = true;
  });
  setTimeout(() => {
    window.$loadingBar.finish();
  }, 10000);
});

const getShareInfo = function(path) {
  if (sharePinia().token === null) {
    showPwd.value = true;
    return Promise.resolve(1);
  }
  window.$loadingBar.start();
  return API.getShareInfo(id.value, path).then(res => {
    shareData.value = res;
    console.log(shareData.value);
    window.$loadingBar.finish();
  });
};

const intoPath = function(path) {
  // const backup = explorerPath.value;
  // if (path === 0) explorerPath.value = [];
  // else if (typeof path === "number") {
  //   explorerPath.value.splice(path, explorerPath.value.length - path);
  // } else if (typeof path === "string") {
  //   explorerPath.value.push(path);
  // }
  // path = explorerPath.value.join("/");
  // list(path).catch(() => {
  //   explorerPath.value = backup;
  // });
};

/* Table */
// 选择的文件
const checkedRowKeysRef = ref([]);
const handleCheck = function(rowKeys) {
  checkedRowKeysRef.value = rowKeys;
};

const columns = readonly([
  {
    type: "selection",
    disabled(row) {
      return row.id === "Edward King 3";
    }
  },
  {
    title: "文件名",
    key: "name",
    render: (row) => {
      return h(
        "a",
        {
          class: "fileLink",
          style: {
            color: row.type === "dir" ? "#E67E22" : "#03885B"
          },
          onClick: (e) => {
            e.stopPropagation();
            if (row.type === "dir") {
              intoPath(row.name);
            } else {
              /*  */
            }
          }
        },
        [fileIcon(row.type), row.name]
      );
    }
  },
  {
    title: "修改日期",
    key: "updateTime",
    width: "170",
    render: (row) => {
      return row.type === "dir"
        ? "-"
        : new Date(row.updateTime).format("YYYY/MM/DD HH:mm");
    }
  },
  {
    title: "类型",
    key: "type",
    width: "100",
    render: (row) => {
      return row.dir === true ? "-" : row.type;
    }
  },
  {
    title: "大小",
    key: "size",
    width: "100",
    render: (row) => {
      const MB = 1048576; // 2 << 20
      return row.type === "dir"
        ? "-"
        : row.size > MB
          ? (row.size / MB).toFixed(2) + "MB"
          : parseInt(row.size / 1024) + "KB";
    }
  },
  {
    title: "操作",
    key: null,
    width: "100",
    render: (row) => {
      // const MB = 1048576; // 2 << 20
      return row.type !== "dir"
        ? h(
          NButton,
          {
            size: "tiny",
            type: "info",
            tertiary: true,
            onClick: () => API.download(row.id, explorerPath.value.join("/"))
          },
          { default: () => "下载" }
        )
        : null;
    }
  }
]);
/* Table END */
</script>

<style lang="scss" scoped>
.share-page {
  width: 100%;
  height: 100%;
  padding-top: 50px;
  box-sizing: border-box;

  .share-header {
    height: 30px;
    display: flex;
    flex-direction: column-reverse;
  }

}

:deep(.fileLink) {
  cursor: pointer;
}

:deep(.fileLink:hover) {
  text-decoration: underline;
}

:deep(.fileIcon) {
  margin-right: 5px;
}
</style>
