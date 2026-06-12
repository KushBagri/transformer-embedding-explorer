// Provider that owns the model inputs and memoizes the derived matrices so all
// consumers read consistent, computed-once values. If re-render cost ever
// shows up in profiling, the internals can move to a store without changing
// the useModel() API.

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ModelContext, deriveModel, type ModelInputs, type ModelValue } from './modelContext'
import { DEFAULT_INPUTS } from './presets'
import { tokenize } from './embeddings'

export function ModelProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputsState] = useState<ModelInputs>(() => ({ ...DEFAULT_INPUTS }))

  const setInputs = useCallback((patch: Partial<ModelInputs>) => {
    setInputsState((prev) => ({ ...prev, ...patch }))
  }, [])

  const setSentence = useCallback((sentence: string) => {
    setInputsState((prev) => ({ ...prev, tokens: tokenize(sentence) }))
  }, [])

  const reset = useCallback(() => setInputsState({ ...DEFAULT_INPUTS }), [])

  const derived = useMemo(() => deriveModel(inputs), [inputs])

  const value = useMemo<ModelValue>(
    () => ({ ...inputs, ...derived, setInputs, setSentence, reset }),
    [inputs, derived, setInputs, setSentence, reset],
  )

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}
