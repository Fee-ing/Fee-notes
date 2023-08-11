<template>
  <div class="page-wrapper flex">
    <el-form label-position="top" :model="form" size="small">
      <el-form-item label="代码类型：">
        <el-select v-model="form.parser">
          <el-option
            v-for="item in codeParserOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单行长度：">
        <el-input-number
          v-model="form.printWidth"
          :min="1"
          :max="1000"
          :step="1"
          step-strictly
        />
      </el-form-item>
      <el-form-item label="缩进空格：">
        <el-input-number
          v-model="form.tabWidth"
          :min="1"
          :max="4"
          :step="1"
          step-strictly
        />
      </el-form-item>
      <el-form-item label="句末使用分号：">
        <el-switch v-model="form.semi" />
      </el-form-item>
      <el-form-item label="使用单引号：">
        <el-switch v-model="form.singleQuote" />
      </el-form-item>
      <el-form-item label="JSX中使用单引号：">
        <el-switch v-model="form.jsxSingleQuote" />
      </el-form-item>
      <el-form-item label="对象前后添加空格：">
        <el-switch v-model="form.bracketSpacing" />
      </el-form-item>
      <el-form-item label="多属性HTML标签的>折行放置：">
        <el-switch v-model="form.bracketSameLine" />
      </el-form-item>
      <el-form-item label="JSX中的多属性HTML标签的>折行放置：">
        <el-switch v-model="form.jsxBracketSameLine" />
      </el-form-item>
      <el-form-item label="箭头函数参数包裹括号：">
        <el-switch v-model="form.arrowParens" />
      </el-form-item>
      <el-form-item label="对HTML全局空白的敏感度：">
        <el-radio-group v-model="form.htmlWhitespaceSensitivity">
          <el-radio label="css">css</el-radio>
          <el-radio label="strict">strict</el-radio>
          <el-radio label="ignore">ignore</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="对Vue文件中的script、style标签缩进：">
        <el-switch v-model="form.vueIndentScriptAndStyle" />
      </el-form-item>
      <el-form-item label="在HTML、Vue和JSX文件中强制每行单一属性：">
        <el-switch v-model="form.singleAttributePerLine" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleStart">美化</el-button>
        <el-button class="copy-btn" type="success" text bg :data-clipboard-text="beautifyCode">复制</el-button>
        <el-button type="warning" text bg @click="handleClear">清空</el-button>
        <el-button type="danger" text bg @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-input class="code-input flex-1" v-model="form.code" type="textarea" placeholder="请输入代码" resize="none" />
    <div class="code-wrapper flex-1">
      <highlightjs
        autodetect
        :code="beautifyCode"
      ></highlightjs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'
import ClipboardJS from 'clipboard'
import { loadJs } from '../utils/func'

const codeParserOptions = [
  { label: '默认', value: 'babel' },
  { label: 'typescript', value: 'typescript' },
  { label: 'html', value: 'html' },
  { label: 'vue', value: 'vue' },
  { label: 'angular', value: 'angular' },
  { label: 'css', value: 'css' },
  { label: 'scss', value: 'scss' },
  { label: 'less', value: 'less' },
  { label: 'json', value: 'json' },
  { label: 'json5', value: 'json5' },
  { label: 'json-stringify', value: 'json-stringify' },
  { label: 'markdown', value: 'markdown' },
]

const initialData = {
  code: '',
  parser: 'babel',
  printWidth: 80,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  bracketSameLine: true,
  jsxBracketSameLine: true,
  arrowParens: true,
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  singleAttributePerLine: false
}

const form = reactive(JSON.parse(JSON.stringify(initialData)))

const beautifyCode = ref('')

const loading = ref(false)

const handleStart = async () => {
  const { code, parser } = form
  if (code === '') return

  loading.value = true

  let scripts = ['standalone', 'plugins/babel', 'plugins/estree']
  if (['html', 'vue'].includes(parser)) {
    scripts = [ ...scripts, 'plugins/html' ]
  } else if (['css', 'scss', 'less'].includes(parser)) {
    scripts = [ ...scripts, 'plugins/postcss' ]
  } else if (parser === 'angular') {
    scripts = [ ...scripts, 'plugins/html', 'plugins/angular' ]
  } else if (parser === 'typescript') {
    scripts = [ ...scripts, 'plugins/typescript' ]
  } else if (parser === 'markdown') {
    scripts = [ ...scripts, 'plugins/markdown' ]
  }
  for (let index = 0; index < scripts.length; index++) {
    const res = await loadJs(`https://unpkg.com/prettier@3.0.1/${scripts[index]}.js`)
    if (!res)  {
      ElNotification({
        title: '提示',
        message: '加载Prettier插件失败，请刷新重试',
        type: 'error',
      })
      loading.value = false
      return
    }
  }
  beautifyCode.value = await prettier.format(code, {
    parser,
    plugins: prettierPlugins,
  })
  loading.value = false
}

const handleClear = () => {
  form.code = ''
  beautifyCode.value = ''
}

const handleReset = () => {
  for (const key in initialData) {
    if (Object.hasOwnProperty.call(initialData, key)) {
      form[key] = initialData[key]
    }
  }
  beautifyCode.value = ''
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
.code-input {
  margin-left: 20px;
  :deep(.el-textarea__inner) {
    height: 100%;
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
.code-wrapper {
  margin-left: 20px;
  :deep(pre) {
    height: 100%;
  }
  :deep(.hljs) {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    word-break: break-all;
    white-space: break-spaces;
  }
}
</style>