/*
  A terminação d.ts indica que esse aquivo irá apresentar apenas código de definição
  de tipos (TypeScript). Aqui poderá ser escrito interfaces e types.
*/

import 'styled-components'
import { defaultTheme } from '../styles/themes/default'

type ThemeType = typeof defaultTheme

/*
  Aqui é criada uma tipagem para o modulo styled-components do npm, então sempre que
  o styled-components for importado em um determinado arquivo, essa tipagem será puxada.

  Como o styled-components foi importado nesse arquivo, seu tipo na realidade está
  sendo sobrescrevido logo abaixo. Se essa importação não tivesse sido realizada, a
  criação de um novo tipo é certa.

  Como o theme provider não traz a visibilidade dos tipos dos themas criados,
  sobreescrever 'o que já existe' não é problema.
*/
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
