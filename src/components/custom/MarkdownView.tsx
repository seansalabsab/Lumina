
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {atomDark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useClipboard } from "@/hooks/useCipboard";
import { useSidebar } from "../ui/sidebar";

export const MarkdownView = ({ text}: {text: string}) => {
  const {open} = useSidebar()
  return (
    <Markdown
            remarkPlugins={[remarkGfm]}
            children={text}
            components={{
              strong({children}){
                return <strong style={{color: "#88a9cb"}}>{children}</strong>
              },
              p({ children }) {
                return <p style={{ marginBottom: "1em", lineHeight: "1.6" }}>{children}</p>
              },
              ul({ children }) {
                return <ul style={{ paddingLeft: "1.5em", marginBottom: "1em", listStyleType: "disc" }}>{children}</ul>
              },
              ol({ children }) {
                return <ol style={{ paddingLeft: "1.5em", marginBottom: "1em", listStyleType: "decimal" }}>{children}</ol>
              },
              li({ children }) {
                return <li style={{ marginBottom: "0.5em" }}>{children}</li>
              },
            code(props) {
              const {children, className, node, ...rest} = props
              const {copy, isCopied} = useClipboard()
              const match = /language-(\w+)/.exec(className || '')
              const codeText = String(children).replace(/\n$/, "")
              const handleCopy = () => {
                copy(codeText)
              }
              return match ? (
                <div 
                  style={{
                    margin: "24px 0", 
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  <div style={{
                    maxWidth: open ? "calc(100vw - 400px)": "100vw",
                    width: "100%"
                  }}>
                  <div 
                    style={{maxWidth: open ? "calc(100vw - 400px)": "100vw", 
                      borderTop: "2px solid #ccc",
                      borderLeft: "2px solid #ccc",
                      borderRight: "2px solid #ccc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding:"8px 16px", 
                      backgroundColor:"#777", 
                      marginBottom:"0", 
                      fontWeight: "bold", 
                      color: "#fff",
                      borderTopRightRadius: "8px",
                      borderTopLeftRadius: "8px"
                  }}>
                    <span>{`~ ${match[1].toUpperCase()}`}</span>
                    <button
                      onClick={handleCopy}
                       style={{
                          backgroundColor: isCopied ? "#4caf50" : "#555",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                    >
                    {isCopied ? "Copied": "Copy"}
                    </button>
                    
                  </div>
                  <SyntaxHighlighter
                    {...(rest as any)} // Fix ref issue by casting props
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    language={match[1]}
                    style={atomDark}
                    customStyle={{
                      borderBottom: "2px solid #ccc",
                      borderLeft: "2px solid #ccc",
                      borderRight: "2px solid #ccc",
                      margin: 0,
                      padding: "16px",
                      borderTopRightRadius: "0",
                      borderTopLeftRadius: "0",
                      borderRadius: "6px",
                    }}
                  />
                    </div>

                </div>
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              )
            }
          }}
        />
    )
}

export default MarkdownView;
