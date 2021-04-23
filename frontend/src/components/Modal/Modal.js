import React from 'react'

import './Modal.css'

const modal = ({
	title,
	canCancel,
	children,
	onCancel,
	onConfirm,
	canConfirm,
	confirmText,
}) => (
	<div className='modal'>
		<header className='modal__header'>
			<h1>{title}</h1>
		</header>
		<section className='modal__content'>{children}</section>
		<section className='modal__actions'>
			{canCancel && (
				<button className='btn' onClick={onCancel}>
					Cancel
				</button>
			)}
			{canConfirm && (
				<button className='btn' onClick={onConfirm}>
					{confirmText}
				</button>
			)}
		</section>
	</div>
)

export default modal
