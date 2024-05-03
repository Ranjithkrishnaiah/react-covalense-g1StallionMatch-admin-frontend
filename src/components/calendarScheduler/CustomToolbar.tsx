import clsx from 'clsx'
import leftArrow from 'src/assets/Vectors/chevron-left.svg';
import rightArrow from 'src/assets/Vectors/chevron-right.svg';

// Props
export let navigateBtn = {
  PREVIOUS: 'PREV',
  NEXT: 'NEXT',
  TODAY: 'TODAY',
  DATE: 'DATE',
}

const CustomToolbar = (props: any) => {
  let {
    localizer: { messages },
    label,
  } = props;

  // On calendar navigation
  const navigate = (action: any) => {
    props.onNavigate(action)
  }

  // for refrence
  const view = (view: any) => {
    props.onView(view)
  }

  // for refrence
  const viewNamesGroup = (messages: any) => {
    let viewNames = props.views
    const view = props.view

    if (viewNames.length > 1) {
      return viewNames.map((name: any) => (
        <button
          type="button"
          key={name}
          className={clsx({ 'rbc-active': view === name })}
          onClick={view.bind(null, name)}
        >
          {messages[name]}
        </button>
      ))
    }
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button
          type="button"
          onClick={() => navigate(navigateBtn.PREVIOUS)}
        >
          <img src={leftArrow} alt='Stallion Match' />
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>
      <button
        type="button"
        onClick={() => navigate(navigateBtn.NEXT)}
      >
        <img src={rightArrow} alt='Stallion Match' />
      </button>
    </div>
  )


}

export default CustomToolbar