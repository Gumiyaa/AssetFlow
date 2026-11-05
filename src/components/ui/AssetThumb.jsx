import { Armchair, Camera, Car, Laptop, Network, Package, Printer } from 'lucide-react'
import { cn } from '../../utils/format'

const CATEGORY_STYLES = {
  'Laptop & PC': { icon: Laptop, gradient: 'from-[#17324d] via-[#1d4463] to-[#0e9384]', glow: '#71d8c7' },
  'Perangkat Jaringan': { icon: Network, gradient: 'from-[#123b66] via-[#1d5b8f] to-[#2e90fa]', glow: '#a8d4ff' },
  'Mesin Kantor': { icon: Printer, gradient: 'from-[#4a2f0b] via-[#8a5b10] to-[#f79009]', glow: '#ffd88f' },
  'Kendaraan Operasional': { icon: Car, gradient: 'from-[#2d1b5e] via-[#4c2f96] to-[#7a5af8]', glow: '#cfc2ff' },
  'Furnitur & Fixture': { icon: Armchair, gradient: 'from-[#4a1424] via-[#8a2340] to-[#e5484d]', glow: '#ffc2c8' },
  Camera: { icon: Camera, gradient: 'from-[#0b3b36] via-[#0d6b60] to-[#169e8d]', glow: '#a8eadd' },
}

const SIZES = {
  sm: { wrap: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  md: { wrap: 'h-11 w-11 rounded-lg', icon: 'h-5 w-5' },
  lg: { wrap: 'h-16 w-16 rounded-xl', icon: 'h-7 w-7' },
  xl: { wrap: 'h-full w-full rounded-xl', icon: 'h-12 w-12' },
}

export default function AssetThumb({ category, size = 'md', className, iconSize }) {
  const config = CATEGORY_STYLES[category] || { icon: Package, gradient: 'from-[#17324d] via-[#214563] to-[#2d5675]', glow: '#9fbcd4' }
  const Icon = config.icon
  const sizing = SIZES[size] || SIZES.md

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br',
        config.gradient,
        sizing.wrap,
        className,
      )}
      aria-hidden="true"
    >
      <span
        className="absolute -right-2 -top-2 h-8 w-8 rounded-full opacity-30 blur-[6px]"
        style={{ background: config.glow }}
      />
      <span className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:7px_7px]" />
      <Icon className={cn('relative text-white drop-shadow-sm', iconSize || sizing.icon)} strokeWidth={1.6} />
      <span className="absolute bottom-0 left-0 h-[3px] w-full bg-white/20" />
    </span>
  )
}
