import styled from 'styled-components'

export const FormContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${(props) => props.theme['gray-100']};
  font-size: 1.125rem;
  font-weight: bold;
  flex-wrap: wrap; // Forçar quebra de linha em telas menores
`

// Criando um estilo base para ser reaproveitado em outros locais
const BaseInput = styled.input`
  background: transparent;
  height: 2.5rem;
  border: 0;
  border-bottom: 2px solid ${(props) => props.theme['gray-500']};

  /*
    Botões não recebem o font-size do elemento pai, necessário defini-lo novamente.
    É possível utilizar o valor inherit para receber o font-size do elemento pai.
  */
  font-size: 1.125rem;
  font-weight: bold;
  padding: 0 0.5rem;
  color: ${(props) => props.theme['gray-100']};

  &:focus {
    box-shadow: none;
    border-color: ${(props) => props.theme['green-500']};
  }

  &::placeholder {
    color: ${(props) => props.theme['gray-500']};
  }
`

// Reaproveitando componente estilizado criado na linha 32
export const TaskInput = styled(BaseInput)`
  /*
    Curiosidade sobre o flex 1:
    
    É basicamente um atalho para setar 3 propriedades flex, são elas:
    - flex-grow -> Eu dou habilidade para o meu componente crescer alem do tamanho original dele?
    - flex-shrink -> Eu dou habilidade para o meu componente diminuir o tamanho dele caso seja necessário?
    - flex-basis -> Qual o tamanho ideal do meu elemento?

    Faz com que ele caiba no espaço disponível, se adaptando caso necessário.
  */
  flex: 1;

  // Removendo seta gerada pelo componente datalist
  &::-webkit-calendar-picker-indicator {
    display: none !important;
  }
`

// Reaproveitando componente estilizado criado na linha 32
export const MinutesAmountInput = styled(BaseInput)`
  width: 4rem;
`
