const mp = require('miniprogram-render')

const {
    Event,
    cache,
    tool,
} = mp.$$adapter

/**
 * 判断两值是否相等
 */
function isEqual(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        // 值为数值，需要考虑精度
        return parseInt(a * 1000, 10) === parseInt(b * 1000, 10)
    }

    if (typeof a === 'object' && typeof b === 'object') {
        if (a === null || b === null) return a === b

        const isAArray = Array.isArray(a)
        const isBArray = Array.isArray(b)
        if (isAArray && isBArray) {
            if (a.length !== b.length) return false
            for (let i = 0, len = a.length; i < len; i++) {
                if (!isEqual(a[i], b[i])) return false
            }
            return true
        } else if (!isBArray && !isBArray) {
            const aKeys = Object.keys(a)
            const bKeys = Object.keys(b)
            if (aKeys.length !== bKeys.length) return false
            for (const key of aKeys) {
                if (!isEqual(a[key], b[key])) return false
            }
            return true
        }
    }

    return a === b
}

/**
 * 检查组件属性
 */
function checkComponentAttr({props = []}, name, domNode, destData, oldData) {
    if (props.length) {
        for (const name of props) {
            let newValue = domNode.getAttribute(name)
            newValue = newValue !== undefined ? newValue : null
            if (!oldData || !isEqual(oldData[name], newValue)) destData[name] = newValue
        }
    }

    // 补充 id、class 和 style
    const newId = domNode.id
    if (!oldData || oldData.id !== newId) destData.id = newId
    const newClass = `wx-comp-${name} node-${domNode.$$nodeId} ${domNode.className || ''}`
    if (!oldData || oldData.className !== newClass) destData.className = newClass
    const newStyle = domNode.style.cssText
    if (!oldData || oldData.style !== newStyle) destData.style = newStyle
}

Component({
    properties: {
        kboneCustomComponentName: {
            type: String,
            value: '',
        },
    },
    options: {
        addGlobalClass: true, // 开启全局样式
        virtualHost: true, // 开启虚拟化 host
    },
    attached() {
        const nodeId = this.dataset.privateNodeId
        const pageId = this.dataset.privatePageId
        const data = {}

        this.nodeId = nodeId
        this.pageId = pageId

        // 记录 dom
        this.domNode = cache.getNode(pageId, nodeId)

        // 自定义组件配置
        const config = cache.getConfig()
        this.compConfig = config.runtime && config.runtime.usingComponents && config.runtime.usingComponents[this.domNode.behavior] || {}

        // 监听全局事件
        this.onSelfNodeUpdate = tool.throttle(this.onSelfNodeUpdate.bind(this))
        this.domNode.$$clearEvent('$$domNodeUpdate', {$$namespace: 'proxy'})
        this.domNode.addEventListener('$$domNodeUpdate', this.onSelfNodeUpdate, {$$namespace: 'proxy'})

        // 监听自定义组件事件
        const {events = []} = this.compConfig
        if (events.length) {
            for (const name of events) {
                this[`on${name}`] = evt => this.callSimpleEvent(name, evt)
            }
        }

        checkComponentAttr(this.compConfig, this.domNode.behavior, this.domNode, data)

        // 执行一次 setData
        if (Object.keys(data).length) this.setData(data)

        // 记录该 domNode 节点对应的自定义组件实例
        this.domNode._wxCustomComponent = this.selectComponent(`.node-${this.domNode.$$nodeId}`)
    },
    detached() {
        this.nodeId = null
        this.pageId = null
        this.domNode._wxCustomComponent = null
        this.domNode = null
    },
    methods: {
        /**
         * 监听当前节点变化
         */
        onSelfNodeUpdate() {
            // 判断是否已被销毁
            if (!this.pageId || !this.nodeId) return

            const newData = {}

            checkComponentAttr(this.compConfig, this.domNode.behavior, this.domNode, newData, this.data)

            this.setData(newData)

            // 更新该 domNode 节点对应的自定义组件实例
            this.domNode._wxCustomComponent = this.selectComponent(`.node-${this.domNode.$$nodeId}`)
        },

        /**
         * 触发简单节点事件
         */
        callSimpleEvent(eventName, evt) {
            const domNode = this.domNode
            if (!domNode) return

            domNode.$$trigger(eventName, {
                event: new Event({
                    name: eventName,
                    target: domNode,
                    eventPhase: Event.AT_TARGET,
                    detail: evt && evt.detail,
                }),
                currentTarget: domNode,
            })
        },
    },
})
