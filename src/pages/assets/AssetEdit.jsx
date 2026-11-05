import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import AssetForm from './AssetForm'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function AssetEdit() {
  const { id } = useParams()
  const { assets, actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const asset = useMemo(() => assets.find((item) => item.id === id || item.code === id), [assets, id])

  const handleSubmit = async (values) => {
    try {
      await actions.updateAsset(asset.id, values)
      toast.success('Perubahan tersimpan', `${values.name} berhasil diperbarui.`)
      navigate(`/assets/${asset.id}`)
    } catch (error) {
      toast.error('Gagal memperbarui aset', error.message)
    }
  }

  if (!asset) {
    return (
      <div className="animate-in">
        <PageHeader backTo="/assets" title="Aset tidak ditemukan" />
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="Data aset tidak tersedia"
            description="Aset mungkin telah dihapus dari penyimpanan demo atau tautan yang Anda buka tidak valid."
            action={<Button variant="primary" to="/assets">Kembali ke daftar aset</Button>}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <PageHeader
        backTo={`/assets/${asset.id}`}
        backLabel={`Kembali ke ${asset.code}`}
        eyebrow="Pembaruan Data Aset"
        title={`Edit ${asset.name}`}
        description="Perbarui identitas, nilai perolehan, penempatan, atau kondisi aset. Perubahan tercatat pada log audit."
      />
      <AssetForm
        key={asset.id}
        mode="edit"
        asset={asset}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/assets/${asset.id}`)}
      />
    </div>
  )
}
