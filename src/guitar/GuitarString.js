import React, { Component } from 'react'
import { StaggeredMotion, spring } from 'react-motion'

import PropTypes from 'prop-types'
import _ from 'lodash'

function lerp (a, b, t) {
  return (b - a) * t + a
}

function distance (x1, y1, x2, y2) {
  const a = x2 - x1
  const b = y2 - y1

  return Math.sqrt(a * a + b * b)
}

class GuitarString extends Component {
  static propTypes = {
    segments: PropTypes.number,
    pickThreshold: PropTypes.number,
    magneticThreshold: PropTypes.number,
    affectedRange: PropTypes.number,
    head: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    tail: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    stiffness: PropTypes.number,
    damping: PropTypes.number
  }
  static defaultProps = {
    head: { x: 0, y: 0 },
    tail: { x: 500, y: 500 },
    pickThreshold: 100,
    magneticThreshold: 10,
    affectedRange: 60,
    segments: 100,
    stiffness: 1500,
    damping: 10
  }
  state = { dragged: false, dragX: 0, dragY: 0 }
  componentWillMount () {
    this.expectedPositions = Array(this.props.segments).fill().map((x, i) => {
      const step = i / this.props.segments
      return {
        x: lerp(this.props.head.x, this.props.tail.x, step),
        y: lerp(this.props.head.y, this.props.tail.y, step)
      }
    })
  }
  componentDidMount () {
    window.addEventListener('mousemove', this.handleMouseMove)
  }
  componentWillUnmount () {
    window.removeEventListener('mousemove', this.handleMouseMove)
  }
  startDrag = (e) => {
    this.setState({ dragged: true, dragX: e.pageX, dragY: e.pageY })
  }
  stopDrag = (e) => {
    this.setState({ dragged: false })
  }
  getClosestPoint = (x, y) => {
    const distances = this.expectedPositions.map(({ x: _x, y: _y }, i) => (
      { i, dist: distance(x, y, _x, _y) }
    ))
    return _.minBy(distances, 'dist')
  }
  handleMouseMove = (e) => {
    const closestPoint = this.getClosestPoint(e.pageX, e.pageY)
    if (this.state.dragged) {
      if (closestPoint.dist >= this.props.pickThreshold) {
        this.setState({ dragged: false })
      } else {
        this.setState({ dragX: e.pageX, dragY: e.pageY })
      }
    } else if (closestPoint.dist <= this.props.magneticThreshold) {
      this.startDrag(e)
    }
  }
  render () {
    const closestPoint = this.getClosestPoint(this.state.dragX, this.state.dragY)
    return (
      <StaggeredMotion
        defaultStyles={this.expectedPositions}
        styles={prevStyles => prevStyles.map((prevStyle, i) => {
          const expected = this.expectedPositions[i]
          const isPivot = i === 0 || i === this.props.segments - 1
          if (isPivot) {
            return expected
          }
          if (this.state.dragged && this.props.pickThreshold >= closestPoint.dist) {
            if (closestPoint.i === i) return { x: this.state.dragX, y: this.state.dragY }
            const draggedExpect = this.expectedPositions[closestPoint.i]
            const dx = this.state.dragX - draggedExpect.x
            const dy = this.state.dragY - draggedExpect.y
            const strength = Math.abs(closestPoint.i - i) / this.props.affectedRange
            if (strength < 1) {
              const cosStrength = Math.cos(strength * Math.PI * 0.5)
              return { x: expected.x + dx * cosStrength, y: expected.y + dy * cosStrength }
            }
          }
          const springOption = { stiffness: this.props.stiffness, damping: this.props.damping }
          return {
            x: spring(expected.x, springOption),
            y: spring(expected.y, springOption)
          }
        })}
      >
        {styles => {
          const d = styles.reduce((d, { x, y }, i) => (
            i === 0
              ? `M${this.props.head.x} ${this.props.head.y} `
              : d + `L${x} ${y} `
          ), '')
          return (
            <path d={d} stroke='black' fill='transparent' />
          )
        }}
      </StaggeredMotion>
    )
  }
}

export default GuitarString
