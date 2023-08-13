<template>
  <div class="page-wrapper page-regexp flex">
    <el-form class="form-wrapper" label-position="top">
      <el-form-item label="正则表达式">
        <el-input
          v-model="form.input"
          type="textarea"
          resize="none"
          placeholder="请先输入正确的正则表达式"
          @input="regexpExec"
        />
      </el-form-item>
      <el-form-item label="匹配内容">
        <div class="input-wrapper" :class="[inputClass, regexp ? '' : 'disabled']">
          <div class="input-content">
            <textarea
              class="input-item input"
              @input="handleInputText"
              @focus="inputClass = 'focus'"
              @blur="inputClass = ''"
            ></textarea>
            <pre
              class="input-item result"
              contenteditable="true"
              v-html="form.result"
            ></pre>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <el-collapse class="regexp-wrapper flex-1" :model-value="['common', 'character']">
      <el-collapse-item
        v-for="(data, row) in regexpList"
        :key="row"
        :title="data.title"
        :name="data.name"
      >
        <div
          class="regexp-item flex-v"
          v-for="(item, col) in data.children"
          :key="col"
          @click="handleChoose(item.value)"
        >
          <div>{{ item.label }}：</div>
          <div>{{ item.value }}</div>
          <el-icon class="copy-btn" :data-clipboard-text="item.value">
            <component :is="'CopyDocument'"></component>
          </el-icon>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ClipboardJS from 'clipboard'
import { ElNotification } from 'element-plus'

const regexpList = [
  {
    name: 'common',
    title: '常用',
    children: [
      {
        label: '手机号',
        value: '/^(0|86|17951)?(1[2-9])[0-9]{9}$/'
      },
      {
        label: '只能输入n个数字',
        value: '/^\\d{n}$/'
      },
      {
        label: '只能输入m到n个数字',
        value: '/^\\d{m,n}$/'
      },
      {
        label: '匹配行首行尾空白',
        value: '/(^\\s*)|(\\s*$)/'
      }
    ]
  },
  {
    name: 'character',
    title: '字符相关',
    children: [
      {
        label: '中文字符',
        value: '/[\\u4e00-\\u9fa5]/gm'
      },
      {
        label: '只能输入数字',
        value: '/^\\d+$/'
      },
      {
        label: '只能输入至少n个以上的数字',
        value: '/^\\d{n,}$/'
      },
      {
        label: '只能由英文字母组成',
        value: '/^[a-z]+$/i'
      },
      {
        label: '只能由大写英文字母组成',
        value: '/^[A-Z]+$/'
      },
      {
        label: '只能由英文和数字组成',
        value: '/^[a-z0-9]+$/i'
      },
      {
        label: '只能由英文、数字和下划线组成',
        value: '/^\\w+$/'
      }
    ]
  }
]

const form = ref({ input: '', result: '', text: '' })

const inputClass = ref('')

const regexp = computed(() => {
  const { input } = form.value
  let reg = null
  try {
    reg = eval(input)
  } catch (error) {
    console.log(error)
    return null
  }
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') return null
  return reg
})

const regexpExec = () => {
  const { text } = form.value
  if (text === '' || !regexp.value) return
  let obj = {}
  if (regexp.value.global) {
    let res = null
    while ((res = regexp.value.exec(text)) !== null)
    {
      obj[res.index] = res[0]
    }
  } else {
    let res = regexp.value.exec(text)
    if (res) obj[res.index] = res[0]
  }
  let html = ''
  for (let index = 0; index < text.length; index++) {
    if (obj[index]) {
      html += `<b>${obj[index]}</b>`
      index += obj[index].length - 1
    } else {
      html += `<i>${text[index]}</i>`
    }
  }
  form.value.result = html
}

const handleInputText = (e) => {
  form.value.text = e.target.value
  regexpExec()
  e.target.style.height = `${e.target.scrollHeight}px`
}

const handleChoose = (val) => {
  form.value.input = val
  regexpExec()
}

onMounted(() => {
  const clipboard = new ClipboardJS('.copy-btn')
  clipboard.on('success', function (e) {
    ElNotification({
      title: '提示',
      message: '复制成功',
      type: 'success',
    })
    e.clearSelection()
  })
  clipboard.on('error', function () {
    ElNotification({
      title: '提示',
      message: '复制失败，请重试',
      type: 'error',
    })
  })
})
</script>

<style lang="less" scoped>
.page-regexp {
  .form-wrapper {
    width: 400px;
  }
  .input-wrapper {
    width: 100%;
    padding: 5px 11px;
    background-color: var(--el-input-bg-color,var(--el-fill-color-blank));
    box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
    border-radius: var(--el-input-border-radius,var(--el-border-radius-base));
    transition: var(--el-transition-box-shadow);
    &:hover {
      box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
    }
    &.focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
    &.disabled {
      .input-item {
        &.input {
          color: var(--el-input-text-color,var(--el-text-color-regular));
        }
        &.result {
          opacity: 0;
        }
      }
    }
    .input-content {
      position: relative;
      overflow: hidden;
    }
    .input-item {
      outline: none;
      background-color: transparent;
      font-size: 14px;
      line-height: 1.5;
      font-family: inherit;
      &::-webkit-scrollbar {
        width: 0;
      }
      &.input {
        position: relative;
        width: 100%;
        min-height: 100px;
        z-index: 10;
        color: transparent;
        caret-color: var(--el-input-text-color,var(--el-text-color-regular));
        border: none;
        resize: none;
      }
      &.result {
        position: absolute;
        left: 0;
        top: 0;
        max-width: 100%;
        max-height: 100%;
        color: var(--el-input-text-color,var(--el-text-color-regular));
        :deep(b) {
          font-style: normal;
          font-weight: normal;
          background-color: #FCFF99;
          &.select {
            opacity: 0;
          }
        }
        :deep(i) {
          font-style: normal;
          font-weight: normal;
          background-color: #fff;
          &.select {
            opacity: 0;
          }
        }
      }
    }
  }
  .regexp-wrapper {
    position: relative;
    top: -13px;
    overflow: hidden;
    border: none;
    margin-left: 20px;
    :deep(.el-collapse-item__header) {
      border: none;
      font-weight: 600;
      font-size: 14px;
    }
    :deep(.el-collapse-item__wrap) {
      border: none;
    }
    :deep(.el-collapse-item__content) {
      padding-bottom: 0;
    }
    .regexp-item {
      height: 30px;
      cursor: pointer;
      line-height: 1;
      &:hover {
        .copy-btn {
          display: block;
        }
      }
      .copy-btn {
        margin-left: 10px;
        display: none;
        font-size: 16px;
        color: var(--el-menu-active-color);
      }
    }
  }
}
</style>