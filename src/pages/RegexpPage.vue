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
    <el-collapse class="regexp-wrapper flex-1 over-h" :model-value="['common']">
      <el-collapse-item
        v-for="(data, row) in regexpList"
        :key="row"
        :title="data.title"
        :name="data.name"
      >
        <div
          class="regexp-item flex-v over-h"
          v-for="(item, col) in data.children"
          :key="col"
          @click="handleChoose(item.value)"
        >
          <div class="item-title">{{ item.label }}：</div>
          <div class="item-content">{{ item.value }}</div>
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
        label: '固定电话 XXX-XXXXXXX XXXX-XXXXXXXX',
        value: '/(\\(\\d{3,4}\\)|\\d{3,4}-|\\s)?\\d{8}/'
      },
      {
        label: '行首行尾空格',
        value: '/(^\\s*)|(\\s*$)/'
      },
      {
        label: '所有空格',
        value: '/\\s+/g'
      },
      {
        label: '身份证号',
        value: '/^(^[1-9]\\d{7}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}$)|(^[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])((\\d{4})|\\d{3}[Xx])$)$/'
      },
      {
        label: 'Email地址',
        value: '/^[A-Za-z0-9\\u4e00-\\u9fa5]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$/'
      },
      {
        label: '域名',
        value: '/^((http:\\/\\/)|(https:\\/\\/))?([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}(\\/)/'
      },
      {
        label: 'IP',
        value: '/((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))/'
      },
      {
        label: '帐号 字母开头、5-16位、字母数字下划线',
        value: '/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/'
      },
      {
        label: '密码 8位以上、字母、数字及特殊符号',
        value: '/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!.,@$%^&*-]).{8,}$/'
      },
      {
        label: 'HTML标签',
        value: '/<(\\S*?)[`^>]*>.*?</>|<.*? />/'
      },
      {
        label: '16进制颜色',
        value: '/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3}|[a-fA-F0-9]{8}|[a-fA-F0-9]{4})$/'
      },
    ]
  },
  {
    name: 'number',
    title: '数字相关',
    children: [
      {
        label: '数字',
        value: '/^[0-9]*$/'
      },
      {
        label: 'n位数字',
        value: '/^\\d{n}$/'
      },
      {
        label: 'm到n位的数字',
        value: '/^\\d{m,n}$/'
      },
      {
        label: '至少n位以上的数字',
        value: '/^\\d{n,}$/'
      },
      {
        label: '带1-2位小数的正数或负数',
        value: '/^(-)?\\d+(.\\d{1,2})?$/'
      },
      {
        label: '正数、负数和小数',
        value: '/^(-|+)?\\d+(.\\d+)?$/'
      },
      {
        label: '有两位小数的正实数',
        value: '/^[0-9]+(.[0-9]{2})?$/'
      },
      {
        label: '非零的正整数',
        value: '/^[1-9]\\d*$/'
      },
      {
        label: '非零的负整数',
        value: '/^-[1-9]\\d*$/'
      },
      {
        label: '非正整数',
        value: '/^-[1-9]\\d*|0$/'
      },
      {
        label: '非负整数',
        value: '/^\\d+$/'
      },
      {
        label: '浮点数',
        value: '/^(-?\\d+)(.\\d+)?$/'
      },
      {
        label: '正浮点数',
        value: '/^[1-9]\\d*.\\d*|0.\\d*[1-9]\\d*$/'
      },
      {
        label: '负浮点数',
        value: '/^-([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*)$/'
      },
      {
        label: '非正浮点数',
        value: '/^((-\\d+(.\\d+)?)|(0+(.0+)?))$/'
      },
      {
        label: '非负浮点数',
        value: '/^\\d+(.\\d+)?$/'
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
    overflow-y: auto;
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
      min-height: 30px;
      cursor: pointer;
      line-height: 1;
      &:hover {
        .copy-btn {
          display: block;
        }
      }
      .item-title {
        white-space: nowrap;
      }
      .item-content {
        word-break: break-all;
        word-wrap: break-word;
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