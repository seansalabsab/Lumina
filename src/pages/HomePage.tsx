import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import AppSidebar from "@/components/custom/AppSidebar";
import MarkdownWithCode from "@/components/custom/MarkdownWithCode";
import MarkdownMessage from "@/components/custom/MarkdownMessage";
import { Separator } from "@radix-ui/react-select";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {Textarea} from "@/components/ui/textarea"
const HomePage = () => {
  const [text, setText] = React.useState<string>(`
A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
~~~js
console.log('It works!')
~~~
`)

const code = `const greet = () => {
  console.log("Hello, World!");
};`;
const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="">
            <SidebarTrigger /> 
            <Separator />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Building Your AI Agent</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Ask any</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div> 
        </header>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
        <MarkdownMessage text={text} />
        <code>"This is  a code"</code>
        <MarkdownWithCode text={markdown} />
              </SidebarInset>
    </SidebarProvider>
  )

}


export default HomePage
