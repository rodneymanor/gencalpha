import React from "react";
import { render } from "react-dom";
import { Icon1 } from "./Icon1";
import { Icon2 } from "./Icon2";
import { Icon3 } from "./Icon3";
import { Icon4 } from "./Icon4";

export function Component() {
  return (
    <>
      <style>{`div {
  box-sizing: border-box;
  outline-color: rgb(44, 132, 219);
  scrollbar-width: thin;
  scrollbar-color: rgba(222, 220, 209, 0.35) rgba(0, 0, 0, 0);

}
a {
  outline-color: rgba(89, 158, 227, 0);
  outline-style: solid;
  outline-width: 2px;
  outline-offset: 2px;
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  height: 36px;
  width: 271px;
  min-width: 0px;
  flex-shrink: 0;
  user-select: none;
  align-items: center;
  white-space-collapse: collapse;
  text-wrap-mode: nowrap;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  scrollbar-width: thin;
  scrollbar-color: rgba(222, 220, 209, 0.35) rgba(0, 0, 0, 0);
  border-radius: 8px;
  padding: 8px 16px 8px 16px;
  text-decoration: none;

}
svg {
  box-sizing: border-box;
  display: block;
  vertical-align: middle;
  flex-shrink: 0;
  outline-color: rgb(44, 132, 219);
  scrollbar-width: thin;
  scrollbar-color: rgba(222, 220, 209, 0.35) rgba(0, 0, 0, 0);

}
path {
  box-sizing: border-box;
  outline-color: rgb(44, 132, 219);
  scrollbar-width: thin;
  scrollbar-color: rgba(222, 220, 209, 0.35) rgba(0, 0, 0, 0);

}
span {
  box-sizing: border-box;
  width: 211px;
  overflow-x: hidden;
  overflow-y: hidden;
  white-space-collapse: collapse;
  text-wrap-mode: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  line-height: 20px;
  outline-color: rgb(44, 132, 219);
  scrollbar-width: thin;
  scrollbar-color: rgba(222, 220, 209, 0.35) rgba(0, 0, 0, 0);
  border: 0px solid rgb(194, 192, 182);

}
`}</style>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          rowGap: "1px",
          columnGap: "1px",
          paddingLeft: "8px",
          paddingRight: "8px",
          paddingTop: "4px",
          border: "0px solid rgb(250, 249, 245)",
          width: "287px",
          backgroundColor: "rgb(31, 30, 29)",
          color: "rgb(250, 249, 245)",
          fontSize: "16px",
          lineHeight: "24px",
          fontFamily:
            'styreneB, "styreneB Fallback", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
      >
        <div
          style={{
            marginBottom: "4px",
            border: "0px solid rgb(250, 249, 245)",
          }}
        >
          <div style={{ border: "0px solid rgb(250, 249, 245)" }}>
            <a
              target="_self"
              aria-label="New chat"
              href="/new"
              style={{
                justifyContent: "flex-start",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDuration: "0.15s",
                color: "rgb(250, 249, 245)",
                border: "0px solid rgb(250, 249, 245)",
              }}
            >
              <div
                style={{
                  marginLeft: "-12px",
                  marginRight: "-12px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  rowGap: "8px",
                  columnGap: "8px",
                  border: "0px solid rgb(250, 249, 245)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    height: "24px",
                    width: "24px",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgb(198, 97, 63)",
                    transitionProperty: "all",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDuration: "0.15s",
                    border: "0px solid rgb(250, 249, 245)",
                    borderRadius: "9999px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgb(255, 255, 255)",
                      transitionProperty:
                        "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDuration: "0.15s",
                      width: "12px",
                      height: "12px",
                      border: "0px solid rgb(255, 255, 255)",
                    }}
                  >
                    <Icon1
                      style={{
                        color: "rgb(255, 255, 255)",
                        transitionProperty:
                          "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
                        transitionTimingFunction:
                          "cubic-bezier(0.4, 0, 0.2, 1)",
                        transitionDuration: "0.15s",
                        border: "0px solid rgb(255, 255, 255)",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: "500",
                    letterSpacing: "-0.35px",
                    color: "rgb(217, 119, 87)",
                    transitionProperty: "all",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDuration: "0.2s",
                    border: "0px solid rgb(217, 119, 87)",
                  }}
                >
                  New chat
                </div>
              </div>
            </a>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            border: "0px solid rgb(250, 249, 245)",
          }}
        >
          <a
            target="_self"
            aria-label="Chats"
            href="/recents"
            style={{
              justifyContent: "center",
              overflowX: "hidden",
              overflowY: "hidden",
              letterSpacing: "-0.4px",
              color: "rgb(194, 192, 182)",
              transitionTimingFunction: "cubic-bezier(0.165, 0.85, 0.45, 1)",
              transitionDuration: "0.3s",
              fontFamily:
                'styreneB, "styreneB Fallback", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
              border: "0px solid rgba(0, 0, 0, 0)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "239px",
                transform: "matrix(1, 0, 0, 1, -8, 0)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                rowGap: "12px",
                columnGap: "12px",
                border: "0px solid rgb(194, 192, 182)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "16px",
                  height: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "0px solid rgb(194, 192, 182)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    border: "0px solid rgb(194, 192, 182)",
                  }}
                >
                  <Icon2 style={{ border: "0px solid rgb(194, 192, 182)" }} />
                </div>
              </div>
              <span style={{}}>
                <div
                  style={{
                    transitionProperty: "all",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDuration: "0.2s",
                    border: "0px solid rgb(194, 192, 182)",
                  }}
                >
                  Chats
                </div>
              </span>
            </div>
          </a>
          <div
            style={{
              position: "absolute",
              right: "0px",
              top: "50%",
              display: "none",
              transform: "none",
              border: "0px solid rgb(250, 249, 245)",
            }}
          ></div>
        </div>
        <div
          style={{
            position: "relative",
            border: "0px solid rgb(250, 249, 245)",
          }}
        >
          <a
            target="_self"
            aria-label="Projects"
            href="/projects"
            style={{
              justifyContent: "center",
              overflowX: "hidden",
              overflowY: "hidden",
              letterSpacing: "-0.4px",
              color: "rgb(194, 192, 182)",
              transitionTimingFunction: "cubic-bezier(0.165, 0.85, 0.45, 1)",
              transitionDuration: "0.3s",
              fontFamily:
                'styreneB, "styreneB Fallback", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
              border: "0px solid rgba(0, 0, 0, 0)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "239px",
                transform: "matrix(1, 0, 0, 1, -8, 0)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                rowGap: "12px",
                columnGap: "12px",
                border: "0px solid rgb(194, 192, 182)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "16px",
                  height: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "0px solid rgb(194, 192, 182)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    border: "0px solid rgb(194, 192, 182)",
                  }}
                >
                  <Icon3 style={{ border: "0px solid rgb(194, 192, 182)" }} />
                </div>
              </div>
              <span style={{}}>
                <div
                  style={{
                    transitionProperty: "all",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDuration: "0.2s",
                    border: "0px solid rgb(194, 192, 182)",
                  }}
                >
                  Projects
                </div>
              </span>
            </div>
          </a>
          <div
            style={{
              position: "absolute",
              right: "0px",
              top: "50%",
              display: "none",
              transform: "none",
              border: "0px solid rgb(250, 249, 245)",
            }}
          ></div>
        </div>
        <div style={{ border: "0px solid rgb(250, 249, 245)" }}>
          <div
            style={{
              position: "relative",
              border: "0px solid rgb(250, 249, 245)",
            }}
          >
            <a
              target="_self"
              aria-label="Artifacts"
              href="/artifacts"
              style={{
                justifyContent: "center",
                overflowX: "hidden",
                overflowY: "hidden",
                letterSpacing: "-0.4px",
                color: "rgb(194, 192, 182)",
                transitionTimingFunction: "cubic-bezier(0.165, 0.85, 0.45, 1)",
                transitionDuration: "0.3s",
                fontFamily:
                  'styreneB, "styreneB Fallback", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                border: "0px solid rgba(0, 0, 0, 0)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "239px",
                  transform: "matrix(1, 0, 0, 1, -8, 0)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  rowGap: "12px",
                  columnGap: "12px",
                  border: "0px solid rgb(194, 192, 182)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "16px",
                    height: "16px",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "0px solid rgb(194, 192, 182)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "16px",
                      height: "16px",
                      border: "0px solid rgb(194, 192, 182)",
                    }}
                  >
                    <Icon4 style={{ border: "0px solid rgb(194, 192, 182)" }} />
                  </div>
                </div>
                <span style={{}}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      rowGap: "8px",
                      columnGap: "8px",
                      transitionProperty: "all",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDuration: "0.2s",
                      border: "0px solid rgb(194, 192, 182)",
                    }}
                  >
                    Artifacts
                  </div>
                </span>
              </div>
            </a>
            <div
              style={{
                position: "absolute",
                right: "0px",
                top: "50%",
                display: "none",
                transform: "none",
                border: "0px solid rgb(250, 249, 245)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

render(<Component />, document.getElementById("root"));
