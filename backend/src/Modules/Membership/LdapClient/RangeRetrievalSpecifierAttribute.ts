import { RangeSpecifier } from './types'

// [attribute];range=[low]-[high]
// matching: 1 = name, 2 = low, 3 = high
const pattern = '^([^;]+);range=(\\d+)-(.+)?$'

/**
 * Parses the range retrieval specifier into an object
 * @param attribute The range retrieval specifier to parse
 * @returns Parsed range specifier
 */
function parseRangeRetrievalSpecifierAttribute(attribute: string): RangeSpecifier {
  const re = new RegExp(pattern, 'i')
  const match = re.exec(attribute)
  
  if (!match) {
    throw new Error(`Invalid range attribute: ${attribute}`)
  }
  
  return {
    attributeName: match[1],
    low: parseInt(match[2], 10),
    high: match[3] === '*' ? null : parseInt(match[3], 10),
  }
}

/**
 * Multi-valued attribute range retrieval specifier
 */
export class RangeRetrievalSpecifierAttribute implements RangeSpecifier {
  attributeName: string
  low: number
  high: number | null

  constructor(attribute: string | RangeSpecifier) {
    if (!attribute) {
      throw new Error('No attribute provided to create a range retrieval specifier.')
    }

    if (typeof attribute === 'string') {
      const parsed = parseRangeRetrievalSpecifierAttribute(attribute)
      this.attributeName = parsed.attributeName
      this.low = parsed.low
      this.high = parsed.high
    } else {
      this.attributeName = attribute.attributeName
      this.low = attribute.low
      this.high = attribute.high
    }
  }

  /**
   * Gets the next range retrieval specifier for a query
   * @returns The next range specifier or null if complete
   */
  next(): RangeRetrievalSpecifierAttribute | null {
    if (this.high !== null && this.high !== this.low) {
      const low = this.low
      const high = this.high

      this.low = high + 1
      this.high = high + (high - low) + 1
      return this
    }
    return null
  }

  /**
   * Gets the string representation of the range retrieval specifier
   * @returns String representation
   */
  toString(): string {
    return `${this.attributeName};range=${this.low}-${this.high !== null ? this.high : '*'}`
  }

  /**
   * Retrieves all of the attributes which have range attributes specified
   * @param item The value to extract the range retrieval attributes from
   * @returns Array of range retrieval specifier attributes or null
   */
  static getRangeAttributes(item: Record<string, any>): RangeRetrievalSpecifierAttribute[] | null {
    const attributes: RangeRetrievalSpecifierAttribute[] = []
    
    for (const attribute in item || {}) {
      if (RangeRetrievalSpecifierAttribute.isRangeAttribute(attribute)) {
        attributes.push(new RangeRetrievalSpecifierAttribute(attribute))
      }
    }
    
    return attributes.length > 0 ? attributes : null
  }

  /**
   * Checks to see if the specified attribute is a range retrieval attribute
   * @param attribute The attribute to inspect
   * @returns true if range attribute, false otherwise
   */
  static isRangeAttribute(attribute: string): boolean {
    const re = new RegExp(pattern, 'i')
    return re.test(attribute)
  }

  /**
   * Checks to see if the specified object has any range retrieval attributes
   * @param item The value to check for range retrieval specifiers
   * @returns true if has range attributes, false otherwise
   */
  static hasRangeAttributes(item: Record<string, any> | undefined): boolean {
    if (!item) return false
    
    return Object.keys(item).some(attribute =>
      RangeRetrievalSpecifierAttribute.isRangeAttribute(attribute)
    )
  }
}

export default RangeRetrievalSpecifierAttribute
