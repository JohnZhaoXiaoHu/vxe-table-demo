<template>
  <div>
    <vxe-table
      border
      highlight-hover-row
      :data="tableData">
      <vxe-column type="seq" width="80"></vxe-column>
      <vxe-column field="name" title="Name" sortable></vxe-column>
      <vxe-column field="sex" title="Sex" sortable>
        <template #default="{ row }">
          <span style="color: blue">{{ row.sex }}</span>
        </template>
      </vxe-column>
      <vxe-column field="address" title="Address">
        <template #default="{ row }">
          <span style="color: red">{{ row.address }}</span>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const tableData = ref([
      { id: 10001, name: 'Test1', role: 'Developer', sex: 'Man', address: 'Address abc123' },
      { id: 10002, name: 'Test2', role: 'Developer', sex: 'Female', address: 'Address rttry' },
      { id: 10003, name: 'Test3', role: 'Developer', sex: 'Man', address: 'Address xxxxx' }
    ])
    return {
      tableData
    }
  }
})
</script>
