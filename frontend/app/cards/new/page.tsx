"use client"

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { ArrowLeft, Camera, Check, FileImage, Info, LoaderCircle, ScanLine, ShieldCheck, Sparkles, Upload, X } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { BusinessCard } from "@/types"
import Navbar from "@/components/layout/Navbar"

export default function NewCardPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const picker = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => { if (!token) router.replace("/login") }, [token, router])

  const addFiles = (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => file.type.startsWith("image/"))
    if (accepted.length < incoming.length) toast.error("Please choose a supported image file, such as JPG or PNG.")
    if (accepted.length) setFiles((current) => [...current, ...accepted].slice(0, 100))
  }
  const onPick = (event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = "" }
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }
  const removeFile = (index: number) => setFiles((current) => current.filter((_, i) => i !== index))

  const processCards = async () => {
    if (!files.length || !token || processing) return
    setProcessing(true)
    setProgress(0)
    let saved = 0
    const failed: string[] = []
    let firstSaved: BusinessCard | null = null
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      try {
        const body = new FormData()
        body.append("file", file)
        const { data } = await api.post<BusinessCard>("/cards/upload", body)
        if (!firstSaved) firstSaved = data
        saved += 1
      } catch {
        failed.push(file.name)
      }
      setProgress(index + 1)
    }
    setProcessing(false)
    setFiles([])
    if (saved) toast.success(`${saved} ${saved === 1 ? "contact was" : "contacts were"} saved automatically.`)
    if (failed.length) toast.error(`${failed.length} ${failed.length === 1 ? "card needs" : "cards need"} another try.`)
    if (saved === 1 && firstSaved) router.push(`/cards/${firstSaved.id}`)
    else if (saved) router.push("/cards")
  }

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{maxWidth:1060}}>
        <Link href="/dashboard" className="text-link" style={{marginBottom:22}}><ArrowLeft size={16}/> Back to overview</Link>
        <div className="page-heading" style={{marginTop:14}}>
          <div><p className="eyebrow">QUICK CAPTURE</p><h1 className="page-title">Scan business cards</h1><p className="page-subtitle">Upload a photo. We’ll read the details and add each contact to your directory.</p></div>
        </div>

        <div className="scan-layout">
          <section className="surface scan-panel">
            <div className={`dropzone ${dragging ? "dragging" : ""}`} onClick={() => picker.current?.click()} onDragOver={(event) => {event.preventDefault();setDragging(true)}} onDragLeave={() => setDragging(false)} onDrop={onDrop} role="button" tabIndex={0} onKeyDown={(event) => {if (event.key === "Enter" || event.key === " ") {event.preventDefault();picker.current?.click()}}} aria-label="Choose or drop business card images">
              <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={onPick}/>
              <input type="file" accept="image/*" capture="environment" className="sr-only" id="camera-picker" onChange={onPick}/>
              {files.length ? <span className="drop-icon"><Check size={25}/></span> : <span className="drop-icon"><Upload size={24}/></span>}
              <h2 className="dropzone-title">{files.length ? `${files.length} ${files.length === 1 ? "image" : "images"} ready to scan` : "Drop card photos here"}</h2>
              <p className="dropzone-copy">or choose image files from your device</p>
              <span className="button button-secondary" style={{marginTop:17}}><FileImage size={16}/> Browse images</span>
            </div>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <label htmlFor="camera-picker" className="button button-secondary" style={{flex:1,cursor:"pointer"}}><Camera size={17}/> Take a photo</label>
              <button className="button button-secondary" style={{flex:1}} onClick={() => picker.current?.click()}><Upload size={16}/> Add more</button>
            </div>
            {files.length > 0 && <div style={{marginTop:22}}>
              <div className="section-row"><div><h3 className="section-title" style={{fontSize:14}}>Ready to scan</h3><p className="section-note">Each successful scan is saved automatically.</p></div><button className="text-link" onClick={() => setFiles([])} disabled={processing}>Clear all</button></div>
              <ul style={{display:"grid",gap:8,listStyle:"none",padding:0,margin:0,maxHeight:215,overflowY:"auto"}}>
                {files.map((file,index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="surface" style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",borderRadius:12}}>
                  <span className="empty-icon" style={{width:35,height:35,margin:0,borderRadius:10}}><FileImage size={17}/></span>
                  <span style={{flex:1,minWidth:0,fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</span>
                  <span style={{color:"#8a968e",fontSize:11,whiteSpace:"nowrap"}}>{(file.size/1024/1024).toFixed(1)} MB</span>
                  <button className="icon-button" style={{width:34,height:34,border:0}} onClick={() => removeFile(index)} disabled={processing} aria-label={`Remove ${file.name}`}><X size={16}/></button>
                </li>)}
              </ul>
              <button className="button button-primary" style={{width:"100%",marginTop:14}} onClick={processCards} disabled={processing}>
                {processing ? <><LoaderCircle size={17} className="spin"/> Scanning {progress} of {files.length}…</> : <><ScanLine size={17}/> Scan and save {files.length === 1 ? "card" : `${files.length} cards`}</>}
              </button>
              {processing && <p className="section-note" style={{textAlign:"center",marginTop:9}}>Successful cards are saved as they finish. A failed card won’t stop the rest.</p>}
            </div>}
            <div style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:17,color:"#78857c",fontSize:11}}><ShieldCheck size={15} style={{flex:"0 0 auto",color:"#4e8367",marginTop:1}}/><span>Photos are used to recognize contact details and stored with your contacts.</span></div>
          </section>

          <aside className="surface scan-aside">
            <span className="empty-icon" style={{margin:"0 0 15px"}}><Sparkles size={21}/></span>
            <h2 className="section-title">From paper to people</h2><p className="section-note">A quick scan keeps your focus on the conversation, not data entry.</p>
            <div className="step-list">
              <div className="step-item"><span className="step-num">01</span><div><strong>Capture a clear photo</strong><p>Keep the card flat, well-lit, and in focus.</p></div></div>
              <div className="step-item"><span className="step-num">02</span><div><strong>We read the details</strong><p>Name, role, company, email, phone, and more.</p></div></div>
              <div className="step-item"><span className="step-num">03</span><div><strong>Saved to your contacts</strong><p>Find the details later from any signed-in device.</p></div></div>
            </div>
            <div style={{display:"flex",alignItems:"flex-start",gap:9,marginTop:23,padding:13,borderRadius:12,background:"#f7f8f4",color:"#6d786f",fontSize:11}}><Info size={15} style={{flex:"0 0 auto",color:"#82906f",marginTop:1}}/><span>Best results with one business card per image. You can add multiple photos at once.</span></div>
          </aside>
        </div>
      </main>
    </>
  )
}
