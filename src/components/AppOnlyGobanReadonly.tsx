import '@sabaki/shudan/css/goban.css'
import GameGobanReadonly from './GameGobanReadonly'
import { Store, GobanContext } from '@/store/store'
import { useMeasure } from '@/hooks/useMeasure'
import { useMemo, useState } from 'preact/hooks'

export interface GobanProps {
  store: Store
}

const AppOnlyGobanReadonly = ({ store }: GobanProps) => {
  const [mref, { width }] = useMeasure()
  const { markdownGobanHeight, markdownGobanWidth } = store

  const calcH = useMemo(() => {
    if (markdownGobanHeight.value && markdownGobanHeight.value !== 'auto') {
      return markdownGobanHeight.value
    }
    return width ? width + 48 : 0
  }, [width, markdownGobanHeight.value])

  return (
    <GobanContext.Provider value={store}>
      <div ref={mref} className="w-full" style={{ width: markdownGobanWidth.value }}>
        {width && calcH ? (
          <div
            className="w-full rounded bg-[var(--background-primary-alt)] game-goban-readonly"
            style={{ height: calcH }}
          >
            <GameGobanReadonly />
          </div>
        ) : null}
      </div>
    </GobanContext.Provider>
  )
}

export default AppOnlyGobanReadonly
