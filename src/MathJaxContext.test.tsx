// @ts-ignore
import React, { FC, ReactElement, useContext } from "react"
import { render } from "@testing-library/react"
import MathJaxContext, { MathJaxBaseContext } from "./MathJaxContext"
import MathJax from "./MathJax"

const math = "\\frac{10}{5}"
let originalConsoleError: (data: any[]) => void

const Wrapped: FC<{ version: 2 | 3 }> = ({ version }) => {
    const mjPromise = useContext(MathJaxBaseContext)
    if (mjPromise && mjPromise.version !== version) throw Error("Wrong version")
    return <></>
}

beforeEach(() => {
    originalConsoleError = console.error
    console.error = jest.fn()
})

afterEach(() => {
    console.error = originalConsoleError
})

it("only fetches MathJax once despite nested contexts", async () => {
    const addFn = jest.fn()
    const originalgetElementsByTagName = document.getElementsByTagName
    document.getElementsByTagName = (tagName: string) => [{ appendChild: addFn }] as any
    render(
        <MathJaxContext version={3}>
            <MathJaxContext version={3}>
                <MathJaxContext version={3}>
                    <MathJax>{`\\$${math}$`}</MathJax>
                </MathJaxContext>
            </MathJaxContext>
        </MathJaxContext>
    )
    expect(addFn).toHaveBeenCalledTimes(1)
    document.getElementsByTagName = originalgetElementsByTagName
}, 15000)

it("first context determines version if context are nested", async () => {
    const rendered = () =>
        render(
            <MathJaxContext version={3}>
                <MathJaxContext version={2}>
                    <MathJaxContext version={2}>
                        <Wrapped version={2} />
                    </MathJaxContext>
                </MathJaxContext>
            </MathJaxContext>
        )
    expect(rendered).toThrow("Wrong version")
}, 15000)
