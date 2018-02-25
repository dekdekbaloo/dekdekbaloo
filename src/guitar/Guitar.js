import React, { Component } from 'react'

import GuitarString from './GuitarString'
import PropTypes from 'prop-types'

class Guitar extends Component {
  static String = GuitarString
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    children: PropTypes.node
  }
  render () {
    return (
      <svg width={this.props.width} height={this.props.height}>
        {this.props.children}
      </svg>
    )
  }
}

export default Guitar
