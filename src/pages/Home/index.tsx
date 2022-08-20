import { HandPalm, Play } from 'phosphor-react'
// React-hook-form e necessário para integração do useForm com validadores externos
import { useForm } from 'react-hook-form'
// O zod é um validador de formularios que pode ser integrado ao useForm atravéz do react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'
// Importando todas as funções de validação de zod e atribuindo a uma unica variável. A lib Zod não temum export Default, por essa razão isso é necessário.
import * as zod from 'zod'
import { useState, useEffect } from 'react'
import { differenceInSeconds } from 'date-fns'

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountDownButton,
  StopCountDownButton,
  TaskInput,
} from './styles'

// Validação de um objeto (por essa razão zod.object({}))
// Definindo configurações de validação do objeto para submit
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O ciclo precisa ser de no minimo 5 minútos.')
    .max(60, 'O ciclo precisa ser de no máximo 60 minútos.'),
})

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

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

export function Home() {
  const [cycle, setCycle] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const activeCycle = cycle.find((cycle) => cycle.id === activeCycleId)

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0

  useEffect(() => {
    let interval: number

    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate,
        )

        if (secondsDifference === totalSeconds) {
          setCycle((state) =>
            state.map((cycle) => {
              if (cycle.id === activeCycleId) {
                return { ...cycle, finishedDate: new Date() }
              } else {
                return cycle
              }
            }),
          )

          setAmountSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          setAmountSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    // Quando uma nova instancia do interval e criada, é necessário cancelar a anterior.
    return () => {
      clearInterval(interval)
    }
  }, [activeCycle, totalSeconds, activeCycleId])

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

  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0

  /*
    A quantidade de minutos é do tipo flutuante, dessa forma pode ser apresentada
    com casas decimais que podem atrapalhar o sistema. Utilizando Math.floor é pos-
    sivel arrendodar essa quantidade para baixo, atribuindo assim o resul-
    tado dos minutos a uma variável, essa do tipo inteiro.
  */
  const minutesAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  /*
    Este padStart garante que se o valor tiver menos de 2 caracteres, o mesmo receberá
    um zero a sua esquerda, ou seja, é possível definir elementos o que uma string vai
    receber com base na quantidade de caracteres que a mesma tem.
  */
  const minutes = String(minutesAmount).padStart(2, '0')
  const seconds = String(secondsAmount).padStart(2, '0')

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [minutes, seconds, activeCycle])

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
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput
            id="task"
            list="task-suggestions"
            placeholder="Dê um nome para o seu projeto"
            disabled={!!activeCycle}
            {...register('task')}
          />

          <datalist id="task-suggestions">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
            <option value="Banana" />
          </datalist>

          <label htmlFor="task">durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            disabled={!!activeCycle}
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

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
