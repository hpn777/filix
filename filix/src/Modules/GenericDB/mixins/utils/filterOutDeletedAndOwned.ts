export default function (column: { name: string }) {
  return (
    column.name !== 'is_deleted' &&
    column.name !== 'deleted_on' &&
    column.name !== 'record_holder_id'
  )
}
