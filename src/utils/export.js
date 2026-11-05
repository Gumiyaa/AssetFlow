function escapeCell(value) {
  const string = value == null ? '' : String(value)
  if (string.includes(',') || string.includes('"') || string.includes('\n')) {
    return `"${string.replaceAll('"', '""')}"`
  }
  return string
}

export function downloadCSV(filename, columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((column) => escapeCell(typeof column.value === 'function' ? column.value(row) : row[column.key]))
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`\uFEFF${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadText(filename, content, type = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function printSection() {
  window.print()
}
