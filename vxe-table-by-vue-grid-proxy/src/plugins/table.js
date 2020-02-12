import Vue from 'vue'
import store from '../store'
import XEAjax from 'xe-ajax'
import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/index.css'

Vue.use(VXETable)

function handleListData (config, callback, defaultCallback) {
  if (config && !XEUtils.isArray(config)) {
    defaultCallback()
    // 如果是字典
    if (/^\$+/.test(config)) {
      const key = config.slice(1)
      store.dispatch('loadDataDictionary')
        .catch(e => e)
        .then(() => {
          if (!store.getters.ddMap[key]) {
            console.error('读取字典配置失败！key=' + key)
          }
          callback(store.getters.ddMap[key])
        })
    } else {
      // 如果是异步请求
      const ajaxOpts = Object.assign({ method: 'GET' }, XEUtils.isString(config) ? { url: config } : config)
      XEAjax(ajaxOpts)
        .then(response => response.json())
        .catch(e => e)
        .then(callback)
    }
  }
}

// 设置默认参数
VXETable.setup({
  grid: {
    /**
     * Grid 封装统一的数据代理
     * 任何支持 Promise 的异步请求库都能对接，不同的库可能用法会不一样，基本大同小异（fetch、jquery、axios、xe-ajax）
     * 支持增删改查自动发送请求
     * 支持 filters 自动请求数据
     * 支持 edit-render 下拉框自动请求数据
     */
    proxyConfig: {
      // 列初始化之前
      beforeColumn ({ $grid, column }) {
        const { filters, editRender } = column
        // 处理筛选请求
        handleListData(filters, data => {
          $grid.setFilter(column, data)
        }, () => {
          column.filters = []
        })
        // 处理渲染器请求
        if (editRender) {
          let config = editRender.options
          switch (editRender.name) {
            case 'select':
              handleListData(config, data => {
                editRender.options = data || []
              }, () => {
                editRender.options = []
              })
              break
          }
        }
      },
      // 统一处理查询规则
      beforeQuery (params) {
        const { options, page, sort, filters } = params
        if (XEUtils.isFunction(options)) {
          return options(params)
        }
        // 处理排序条件
        const queryParams = {
          sort: sort.property,
          order: sort.order
        }
        // 处理筛选条件
        filters.forEach(({ property, values }) => {
          queryParams[property] = values.join(',')
        })
        const ajaxOpts = Object.assign({ method: 'GET', params: queryParams }, XEUtils.isString(options) ? { url: options } : options)
        if (page) {
          ajaxOpts.url = XEUtils.template(ajaxOpts.url, { page })
        }
        return XEAjax(ajaxOpts).then(response => response.json())
      },
      // 统一处理删除规则
      beforeDelete (params) {
        const { options, body } = params
        if (XEUtils.isFunction(options)) {
          return options(params)
        }
        const ajaxOpts = Object.assign({ method: 'POST', body }, XEUtils.isString(options) ? { url: options } : options)
        return XEAjax(ajaxOpts).then(response => response.json())
      },
      // 统一处理保存规则
      beforeSave (params) {
        const { options, body } = params
        if (XEUtils.isFunction(options)) {
          return options(params)
        }
        const ajaxOpts = Object.assign({ method: 'POST', body }, XEUtils.isString(options) ? { url: options } : options)
        return XEAjax(ajaxOpts).then(response => response.json())
      }
    }
  }
})

// 创建一个字典翻译渲染器
VXETable.renderer.add('DICT', {
  renderDefault (h, renderOpts, params) {
    const { props } = renderOpts
    const { row, column } = params
    const cellValue = XEUtils.get(row, column.property)
    const rest = store.getters.ddMap[props.code]
    const item = rest && rest.find(item => item.value === cellValue)
    return [
      h('span', {
        style: {
          color: cellValue === '1' ? 'green' : 'red'
        }
      }, item ? item.label : '')
    ]
  }
})
