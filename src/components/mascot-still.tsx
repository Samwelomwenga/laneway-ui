import { getImageProps } from "next/image"

export type MascotBoxProps = Readonly<{ className: string, sizes: string }>

export function MascotStill({ file, className, sizes }: MascotBoxProps & Readonly<{ file: string }>) {
  const { props: { src, ...props } } = getImageProps({
    src: `/mascot/768/${file}`,
    alt: "",
    width: 768,
    height: 768,
    unoptimized: true,
    loading: "eager",
  })
  return (
    // eslint-disable-next-line next/no-img-element -- next/image builds srcset widths from its own size list and drops a srcSet prop, so it can't point 384w and 768w at the two width folders.
    <img
      {...props}
      alt=""
      aria-hidden
      srcSet={`/mascot/384/${file} 384w, /mascot/768/${file} 768w`}
      sizes={sizes}
      className={className}
      src={src}
    />
  )
}
