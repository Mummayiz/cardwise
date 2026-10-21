"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { FileSpreadsheet, LoaderCircle, Smartphone } from "lucide-react"
import { downloadFile } from "@/lib/downloads"

export default function ExportActions({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState<"excel" | "vcf" | null>(null)

  const handleDownload = async (kind: "excel" | "vcf") => {
    if (loading) return
    setLoading(kind)
    try {
      if (kind === "excel") {
        await downloadFile("/exports/contacts.xlsx", "Master_Contacts.xlsx")
        toast.success("Master contact register downloaded")
      } else {
        await downloadFile("/exports/contacts.vcf", "Contacts.vcf")
        toast.success("Contacts ready to import")
      }
    } catch {
      toast.error(`Couldn’t export ${kind === "excel" ? "the Excel register" : "your contacts"}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  return <div className={`export-actions ${compact ? "compact" : ""}`}>
    <button className="button button-secondary" onClick={() => handleDownload("excel")} disabled={loading !== null}>
      {loading === "excel" ? <LoaderCircle size={17} className="spin"/> : <FileSpreadsheet size={17}/>}<span>Download Excel</span>
    </button>
    <button className="button button-secondary" onClick={() => handleDownload("vcf")} disabled={loading !== null}>
      {loading === "vcf" ? <LoaderCircle size={17} className="spin"/> : <Smartphone size={17}/>}<span>Export VCF</span>
    </button>
  </div>
}
