import React, { Component } from 'react'

import Guitar from './guitar/Guitar'

class App extends Component {
  render () {
    return (
      <div>
        <Guitar width={1000} height={1000}>
          {Array(10).fill().map((x, i) => (
            <Guitar.String
              key={i}
              head={{ x: 0, y: 10 + i * 40 }}
              segments={60}
              affectedRange={20}
              pickThreshold={50}
              magneticThershold={5}
              damping={3}
            />
          ))}
        </Guitar>
      </div>
    )
  }
}

export default App
