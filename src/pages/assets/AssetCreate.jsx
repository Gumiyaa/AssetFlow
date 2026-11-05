import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import AssetForm from './AssetForm'

export default function AssetCreate() {
  const { actions } = useData()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    try {
      const asset = await actions.createAsset(values)
      toast.success('Aset berhasil diregistrasi', `${asset.code} · ${asset.name}`)
      navigate(`/assets/${asset.id}`)
    } catch (error) {
      toast.error('Gagal menyimpan aset', error.message)
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        backTo="/assets"
        backLabel="Kembali ke daftar aset"
        eyebrow="Registrasi Aset"
        title="Tambah Aset Baru"
        description="Lengkapi data aset dengan teliti. Nomor aset dan kode inventaris akan dibuat otomatis oleh sistem."
      />
      <AssetForm mode="create" onSubmit={handleSubmit} onCancel={() => navigate('/assets')} />
    </div>
  )
}
