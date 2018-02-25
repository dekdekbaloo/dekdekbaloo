import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { StaggeredMotion, spring } from 'react-motion'
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
    affectedRange: 60,
    segments: 100,
    stiffness: 1500,
    damping: 10
  }
  state = { dragged: false, dragX: 0, dragY: 0 }
  componentDidMount () {
    window.addEventListener('mousemove', this.handleMouseMove)
  }
  componentWillUnmount () {
    window.removeEventListener('mousemove', this.handleMouseMove)
  }
  startDrag = (e) => {
    this.setState({ dragged: true, dragX: e.clientX, dragY: e.clientY })
  }
  stopDrag = (e) => {
    this.setState({ dragged: false })
  }
  handleMouseMove = (e) => {
    if (this.state.dragged) {
      this.setState({ dragX: e.clientX, dragY: e.clientY })
    }
  }
  render () {
    const expectedPositions = Array(this.props.segments).fill().map((x, i) => {
      const step = i / this.props.segments
      return {
        x: lerp(this.props.head.x, this.props.tail.x, step),
        y: lerp(this.props.head.y, this.props.tail.y, step)
      }
    })
    const distances = expectedPositions.map(({ x, y }, i) => (
      { i, dist: distance(x, y, this.state.dragX, this.state.dragY) }
    ))
    const closestIndex = _.minBy(distances, 'dist').i

    return (
      <StaggeredMotion
        defaultStyles={expectedPositions}
        styles={prevStyles => prevStyles.map((prevStyle, i) => {
          const expected = expectedPositions[i]
          const isPivot = i === 0 || i === this.props.segments - 1
          if (isPivot) {
            return expected
          }
          if (this.state.dragged && this.props.pickThreshold >= distances[closestIndex].dist) {
            if (closestIndex === i) return { x: this.state.dragX, y: this.state.dragY }
            const draggedExpect = expectedPositions[closestIndex]
            const dx = this.state.dragX - draggedExpect.x
            const dy = this.state.dragY - draggedExpect.y
            const strength = Math.abs(closestIndex - i) / this.props.affectedRange
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
            <svg
              width={Math.abs(this.props.head.x - this.props.tail.x)}
              height={Math.abs(this.props.head.y - this.props.tail.y)}
              onMouseEnter={this.startDrag}
              onMouseLeave={this.stopDrag}
            >
              <path d={d} stroke='black' fill='transparent' />
            </svg>
          )
        }}
      </StaggeredMotion>
    )
  }
}

export default GuitarString
