import { HandPalm, Play } from 'phosphor-react'
// React-hook-form e necessário para integração do useForm com validadores externos
import { FormProvider, useForm } from 'react-hook-form'
// O zod é um validador de formularios que pode ser integrado ao useForm atravéz do react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'
// Importando todas as funções de validação de zod e atribuindo a uma unica variável. A lib Zod não temum export Default, por essa razão isso é necessário.
import * as zod from 'zod'
import { useState, createContext } from 'react'

import {
  HomeContainer,
  StartCountDownButton,
  StopCountDownButton,
} from './styles'
import { NewCycleForm } from './components/NewCycleForm'
import { Countdown } from './components/Countdown'

// Validação de um objeto (por essa razão zod.object({}))
// Definindo configurações de validação do objeto para submit
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O ciclo precisa ser de no minimo 5 minútos.')
    .max(60, 'O ciclo precisa ser de no máximo 60 minútos.'),
})

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CycleContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
}

/*
  Sempre que se quer referênciar uma variável JS dentro do TS é necessário utilizar
  o typeof. Dessa forma é possível criar um tipo por inferência automático.

  O zod tem a capacidade de inferir o tipo a partir da validação, sem a necessidade
  da criação de uma interface para tipar os inputs do formulário como na linha seguinte:
  
  interface NewCycleFormData {
    task: string
    minutesAmount: number
  }

  basta utilizar zod.infer<typeof TIPO DO SCHEMA>
*/
type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

export const CycleContext = createContext({} as CycleContextType)

export function Home() {
  const [cycle, setCycle] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  const activeCycle = cycle.find((cycle) => cycle.id === activeCycleId)

  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function markCurrentCycleAsFinished() {
    setCycle((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )
  }

  function handleCreateNewCycle(data: NewCycleFormData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    // Sempre que precisa-se do estado mais atualizado (cycle), utiliza-se uma função para recolher o cycle em sí
    setCycle((state) => [...state, newCycle])
    setActiveCycleId(id)
    setAmountSecondsPassed(0) // Resetando minutos de uma instância passada

    reset()
  }

  function handleInterruptedCycle() {
    setCycle((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )

    setActiveCycleId(null)
  }

  /*
    Watch é um observador do useForm. A ca mudança a variável task receberá o valor
    atualizado do input.
  */
  const task = watch('task')

  // Clean code - Melhora a legibilidade do código sem afetar o mesmo negativamente
  const isSubmiteDisabled = !task

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)}>
        <CycleContext.Provider
          value={{
            activeCycle,
            activeCycleId,
            markCurrentCycleAsFinished,
            amountSecondsPassed,
            setSecondsPassed,
          }}
        >
          <FormProvider {...newCycleForm}>
            <NewCycleForm />
          </FormProvider>
          <Countdown />
        </CycleContext.Provider>

        {activeCycle ? (
          <StopCountDownButton onClick={handleInterruptedCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountDownButton>
        ) : (
          <StartCountDownButton disabled={isSubmiteDisabled} type="submit">
            <Play size={24} />
            Começar
          </StartCountDownButton>
        )}
      </form>
    </HomeContainer>
  )
}
