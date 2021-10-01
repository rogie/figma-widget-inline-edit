const { widget } = figma
const { AutoLayout, Frame, Text, useSyncedState, useWidgetId, usePropertyMenu } = widget

function TextEditor() {

  const editableText = (name, text = "Edit me", textProps?) => {

    const [state,setState] = useSyncedState(name, {
      editing: false, 
      value: text, 
      caret: 0,
      selection: ''
    })

    const {SVG, Frame} = widget

    const caretSVG = `<svg width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="1" y1="4.37114e-08" x2="0.999999" y2="20" stroke="#9B51E0" stroke-width="2"/>
    </svg>`

    const click = () => {
      state.editing = true 
      setState(state)
      return new Promise( (resolve) => { 
        figma.showUI(`<input type="text" value="${state.value}" /><script>
            let input = document.querySelector("input")
            input.addEventListener("keyup", function(e){
                parent.postMessage({ pluginMessage: {
                  value: this.value.trim(),
                  /*selection: window.getSelection().toString(),*/
                  caret: e.target.selectionStart
                }},'*')
              })
            input.addEventListener("blur",() => {
              parent.postMessage({ pluginMessage: "close"},'*')
            })
            input.focus()
            input.select()
          </script>`,
          {
            visible: true,
            position: {
              x: -100000,
              y: -100000
            }
          }
        )
        figma.ui.on('message', (message) => {
          console.log(message)
          let {value, caret, selection} = message
          if(message !== 'close'){
            state.value = value 
            state.caret = caret
            //state.selection = selection
            setState(state)
          } else if(message === 'close'){
            state.editing = false 
            setState(state)
            resolve(null)
          }
        })
        figma.on("close", () => { resolve(null)})
      })
    }
    

    const render = () => {
      return state.editing? 
        <Frame overflow="visible" width="fill-parent" height={textProps.lineHeight}>
          <AutoLayout x={0} y={0} direction="horizontal" verticalAlignItems="center">
            <Text {...textProps} opacity={0}>{state.value.substr(0,state.caret)}</Text>
            <Frame height={textProps.lineHeight} fill="#9B51E0" opacity={0.5} width={2} />
          </AutoLayout>
          {// selection box (it felt too native, like i could select)
          /*<AutoLayout x={0} y={0} opacity={0} width="hug-contents">
            <Text {...textProps} opacity={0}>{state.value.substr(0,state.caret)}</Text>
            <AutoLayout fill="#9B51E0" opacity={0.5}>
              <Text {...textProps} opacity={0}>{state.selection}</Text>
            </AutoLayout>
          </AutoLayout>*/}
          <Text {...textProps}>{state.value}</Text>
        </Frame>
        :
        <Text {...textProps} onClick={click}>{state.value}</Text>
    }

    return [state.value, click, render]
  }

  let [name, editName, renderName] = editableText('name',"Editable text!", {
    fontSize: 20,
    lineHeight: 24
  })

  let [title, editTitle, renderTitle] = editableText('title',"Editable text!", {
    fontSize: 16,
    lineHeight: 16
  })

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={300}
      height="hug-contents"
      {...{
        stroke: {type: 'solid', color: { r: 0, g: 0, b: 0, a: 0.1 }},
        strokeWidth: 0.5,
        fill: "#FFF",
        padding: 32,
        cornerRadius: 32,
        effect: {
            type: 'drop-shadow',
            color: { r: 0, g: 0, b: 0, a: 0.15 },
            offset: { x: 0, y: 2 },
            blur: 4
        }
      }}>
      {renderName()}
      <Frame height={16} />
      {renderTitle()}
    </AutoLayout>
  )
}
widget.register(TextEditor)