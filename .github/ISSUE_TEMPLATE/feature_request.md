---
name: Feature request
about: Suggest an idea for this project
title: "[FEAT]"
labels: enhancement
assignees: ''

---

name: 功能建议 / 新需求
description: 提出新功能、优化建议、代码改进方案
title: '[FEAT] '
labels: ['enhancement']
assignees: ''

body:
  - type: textarea
    id: target
    attributes:
      label: 需求简述
      placeholder: 简述想要新增/优化什么功能
    validations:
      required: true

  - type: textarea
    id: scene
    attributes:
      label: 使用场景
      placeholder: 在什么场景下需要该功能，解决了什么痛点
    validations:
      required: true

  - type: textarea
    id: advantage
    attributes:
      label: 带来的提升与价值
      placeholder: 提升效率、简化操作、完善兼容性等
    validations:
      required: true

  - type: textarea
    id: idea
    attributes:
      label: 大致实现思路（可选）
      placeholder: 有代码思路、参考方案、相关文档链接均可填写
    validations:
      required: false

  - type: textarea
    id: comment
    attributes:
      label: 额外备注
      placeholder: 相关参考项目、示例代码、使用案例等
