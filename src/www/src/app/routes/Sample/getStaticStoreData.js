import sanitize from "../../../utils/getRoute/sanitize";

export default ({ data, match, hasUrlBodyStyle }) => {
 
  const {
    condition,
    intent,
    shortcategory,
    subcategory,
    imagePath,
    productClass,
    yearid: year,
    product,
    chromeStyleIds,
    priceRange,
  } = data?.info || {};


  const { trimName: trim, id: productId, name: productName } = product || {};
  const { baseValue: price } = priceRange || {};

  return {
    year,
    productClass,
    productId,
    productName,
    imagePath,
    condition,
    intent,
    subcategory,
    shortcategory,
    chromeStyleId: chromeStyleIds && chromeStyleIds.length && chromeStyleIds.length > 0 ? chromeStyleIds[0] : null,
    price,
  }
}