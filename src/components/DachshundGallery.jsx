import { useEffect, useState } from 'react'

export default function DachshundGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://dog.ceo/api/breed/dachshund/images/random/3')
      .then(r => r.json())
      .then(data => {
        setImages(data.message)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not fetch the dachshunds. They must be napping.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/5 animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center text-gray-500 py-8 text-sm">{error}</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {images.map((url, i) => (
        <div
          key={i}
          className="aspect-square overflow-hidden rounded-xl border border-white/10 group"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <img
            src={url}
            alt={`Dachshund ${i + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
