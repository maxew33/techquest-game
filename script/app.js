let story

fetch('../data/story.json')
    .then((response) => response.json())
    .then((data) => {
        console.log(data, data.story)
        launchGame(data.story)
    })
    .catch((error) => {
        console.error(
            'Une erreur est survenue lors du chargement du fichier JSON :',
            error
        )
    })

const launchGame = (story) => {
    console.log(story)

    const $textSection = document.querySelector('.text')

    let prevId = [0, 0], //store the 2 previous answers
        newId = 1,
        textId = 0, // add a specific id for each paragraph
        currentParagraph,
        formerTextLength = 0, //for the typewritter effect, store the qty of characters
        answerInput

    const findText = (id) => {
        const $section = document.createElement('div')
        $section.id = 'text' + textId // the id of the div for the labelledby id ARIA (will read the whole div)

        if (prevId[1] === id && prevId[1] !== 190) {
            writeText('Réponse invalide'.split(''), $section, false)
        }

        // store the two last id
        prevId[0] = prevId[1]
        prevId[1] = id

        currentParagraph = story.find((storyPart) => {
            return storyPart['id'] === id
        })

        // get each sentences of the paragraph
        const paragraphText = [...currentParagraph.text]

        paragraphText.forEach((text, idx) => {
            //get each letter of the sentence
            const textArray = text.split('')

            const textLength = textArray.length

            setTimeout(() => {
                writeText(
                    textArray,
                    $section,
                    idx === paragraphText.length - 1 ? true : false
                )
            }, (formerTextLength + 1) * 10)

            formerTextLength += textLength
        })
    }

    //add the text in the paragraph, if answerInput === true trigger the appendInput function
    const writeText = (text, $section, answerInput) => {
        const $container = document.createElement('p')
        $container.classList.add('paragraph')

        //typewritter effect
        text.forEach((char, idx) => {
            setTimeout(() => {
                $container.innerHTML += char
                if (
                    answerInput &&
                    prevId[1] !== 18 &&
                    idx === text.length - 1
                ) {
                    appendInput($container)
                    formerTextLength = 0
                }
            }, idx * 10)
        })

        $section.appendChild($container)

        $textSection.appendChild($section)
    }

    // add the input at the end of the paragraph
    const appendInput = (container) => {
        container.innerHTML += `
            <div class="answer-container active">
                <input type="text" class="answer" aria-labelledby="text${textId}"/>
            </div>`

        const answer = document.querySelectorAll('.answer')
        answerInput = answer[answer.length - 1]
        answerInput.focus()

        // Move the paragraph up if it is too low on the page.
        if (
            window.innerHeight - answerInput.getBoundingClientRect().bottom <
            window.innerHeight * 0.4
        ) {
            document.querySelector('body').style.height =
                document.querySelector('body').getBoundingClientRect().height +
                window.innerHeight * 0.3 +
                'px'
            window.scrollTo({
                top: document.querySelector('body').getBoundingClientRect()
                    .height,
                behavior: 'smooth',
            })
        }

        answerInput.addEventListener('input', checkAnswer)

        textId++
    }

    const checkAnswer = (e) => {
        const formerInput = document.querySelector('.active')
        formerInput.classList.remove('active')
        switch (e.target.value) {
            case '0':
                prevId[1] === 20 && exitGame()
                newId = 20
                break

            case '1':
                newId = currentParagraph.path[0]
                break

            case '2':
                newId = currentParagraph.path[1]
                break

            default:
                console.log('error')
                break
        }
        1
        answerInput.removeEventListener('input', checkAnswer)
        answerInput.disabled = true

        // trying to escape but still stay
        newId === 22 && (newId = prevId[0])

        // end and escape the game
        newId === 18 && exitGame()

        newId === 21 ? exitGame() : findText(newId)
    }

    const exitGame = () => {
        window.location = 'https://maxime-malfilatre.com'
    }

    findText(newId)

    //Exit the game with the escape key
    window.addEventListener('keydown', (e) => e.key === 'Escape' && exitGame())

    //Refocus when the user is back on the page
    document.addEventListener('visibilitychange', () => {
        const state = document.visibilityState
        state && answerInput.focus()
    })
}
