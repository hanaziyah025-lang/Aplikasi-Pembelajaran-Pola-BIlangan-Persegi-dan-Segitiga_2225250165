import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Ilustrasi 3D titik pola. Geser untuk memutar. Tanpa teks tambahan agar tidak mengganggu.
export default function Pattern3D({ type = 'persegi', n = 4 }) {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current, w = el.clientWidth, h = 270
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    cam.position.set(0, n * 1.15 + 2.2, n * 1.75 + 3)
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    r.setSize(w, h); r.setPixelRatio(Math.min(devicePixelRatio, 2)); el.appendChild(r.domElement)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const l = new THREE.DirectionalLight(0xffffff, 1.5); l.position.set(3, 8, 5); scene.add(l)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-4, 3, -5); scene.add(fill)
    const geo = new THREE.SphereGeometry(0.42, 24, 24)
    const mat = new THREE.MeshStandardMaterial({
      color: type === 'persegi' ? 0x2563eb : 0xf59e0b,
      roughness: 0.34,
      metalness: 0.04,
    })
    for (let row = 0; row < n; row++) {
      const cnt = type === 'persegi' ? n : row + 1
      for (let c = 0; c < cnt; c++) {
        const m = new THREE.Mesh(geo, mat)
        m.position.set((c - (cnt - 1) / 2) * 1.2, 0, (row - (n - 1) / 2) * 1.2)
        scene.add(m)
      }
    }
    const ctl = new OrbitControls(cam, r.domElement)
    ctl.enablePan = false; ctl.enableZoom = false
    ctl.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ctl.autoRotateSpeed = 0.8
    let raf
    const loop = () => { ctl.update(); r.render(scene, cam); raf = requestAnimationFrame(loop) }
    loop()
    return () => { cancelAnimationFrame(raf); ctl.dispose(); r.dispose(); geo.dispose(); mat.dispose(); el.removeChild(r.domElement) }
  }, [type, n])
  return (
    <figure className="pattern-figure">
      <div ref={ref} className="viz" role="img" aria-label={`Pola ${type} gambar ke-${n}`} />
      <figcaption>Geser untuk memutar</figcaption>
    </figure>
  )
}
