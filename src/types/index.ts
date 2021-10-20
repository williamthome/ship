/* eslint-disable @typescript-eslint/ban-types */

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>

export type IntervalId = ReturnType<typeof setInterval>

export type RGB = {
  r: number
  g: number
  b: number
}

export type RGBA = RGB & {
  a: number
}

export type HSL = {
  h: number
  s: number
  l: number
}
