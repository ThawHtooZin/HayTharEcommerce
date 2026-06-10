import { Globe, Heart, Sparkles, Truck } from 'lucide-react'
import { productImage } from '../lib/products'

const stats = [
  { icon: Heart, title: '50k+ orders', subtitle: 'shipped & loved' },
  { icon: Globe, title: 'Worldwide', subtitle: '60+ countries' },
  { icon: Truck, title: 'Fast ship', subtitle: '1-2 day handling' },
  { icon: Sparkles, title: 'Weekly drops', subtitle: 'new cute things' },
]

export default function About() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
        <span className="inline-flex items-center gap-1 rounded-full bg-blush px-4 py-1.5 text-xs font-semibold text-pink">
          ✨ Our story
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold text-plum sm:text-5xl">
          Cute is a lifestyle.
        </h1>
        <p className="mt-4 text-plum/70 leading-relaxed">
          We started HayThar in 2022 with one tiny axolotl plushie and a big idea: kawaii shouldn't be hard to find.
          Today we ship thousands of orders worldwide to fellow cuteness lovers.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blush text-pink">
                <Icon size={18} />
              </div>
              <h3 className="mt-3 font-display font-semibold text-plum">{title}</h3>
              <p className="text-xs text-plum/50">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="grid items-center gap-8 rounded-3xl bg-gradient-to-br from-blush to-lavender/40 p-8 lg:grid-cols-2 lg:p-12">
          <img
            src={productImage('711695691_3188528371534738_8563441142632076045_n.jpg')}
            alt="Mochi axolotl plush"
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h2 className="font-display text-3xl font-bold text-plum">Made with love, sourced with care</h2>
            <p className="mt-4 text-plum/70 leading-relaxed">
              Every item in our catalog is hand-picked for quality, cuteness, and that special spark that makes you smile.
              From trendy apparel and car accessories to home goods and mystery blind boxes — we curate the best kawaii finds so you don't have to.
            </p>
            <p className="mt-4 text-plum/70 leading-relaxed">
              Have questions? Reach us at <a href="mailto:hello@haythar.com" className="font-semibold text-pink hover:underline">hello@haythar.com</a> — we'd love to hear from you!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
