import { Play } from 'phosphor-react'
// React-hook-form e necessário para integração do useForm com validadores externos
import { useForm } from 'react-hook-form'
// O zod é um validador de formularios que pode ser integrado ao useForm atravéz do react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'
// Importando todas as funções de validação de zod e atribuindo a uma unica variável. A lib Zod não temum export Default, por essa razão isso é necessário.
import * as zod from 'zod'
import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  TaskInput,
} from './styles'

// Validação de um objeto (por essa razão zod.object({}))
// Definindo configurações de validação do objeto para submit
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O ciclo precisa ser de no minimo 65 minútos.')
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

export function Home() {
  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  function handleCreateNewCycle(data: NewCycleFormData) {
    console.log(data)
    reset()
  }

  /*
    Observando o valor do input task em tempo real sem a necessidade do mesmos ser
    um componente controlado. Isso melhora a performance da aplicação.
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
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>0</span>
          <span>0</span>
          <Separator>:</Separator>
          <span>0</span>
          <span>0</span>
        </CountdownContainer>

        <StartCountdownButton disabled={isSubmiteDisabled} type="submit">
          <Play size={24} />
          Começar
        </StartCountdownButton>
      </form>
    </HomeContainer>
  )
}
