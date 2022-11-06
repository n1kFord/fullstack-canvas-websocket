import React, {useEffect, useRef, useState} from 'react';
import "../styles/canvas.scss";
import {observer} from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Rect from "../tools/Rect";
import {Button, Modal} from "react-bootstrap";
import {useParams} from "react-router-dom";
import Eraser from "../tools/Eraser";
import Circle from "../tools/Circle";
import axios from "axios";

const Canvas = observer(() => {
    const canvasRef = useRef();
    const usernameRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const params = useParams();

    useEffect(() => {
        canvasState.setCanvas(canvasRef.current)
        let ctx = canvasRef.current.getContext('2d')
        axios.get(`http://localhost:4000/image?id=${params.id}`)
            .then(response => {
                const img = new Image()
                img.src = response.data
                img.onload = () => {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
                }
            })
    }, []);

    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket(`ws://localhost:4000`);
            canvasState.setSocket(socket);
            canvasState.setSessionId(params.id);
            toolState.setTool(new Brush(canvasRef.current, socket, params.id));
            socket.onopen = () => {
                console.log('ok')
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: "connection",
                }))
            }

            socket.onmessage = (e) => {
                let msg = JSON.parse(e.data);
                switch (msg.method) {
                    case "connection":
                        console.log(`Пользователь ${msg.username} успешно подключился`)
                        break;

                    case "draw":
                        drawHandler(msg);
                        break;
                }
            }
        }
    }, [canvasState.username]);

    const drawHandler = (msg) => {
        const figure = msg.figure;
        const ctx = canvasRef.current.getContext('2d');
        switch (figure.type) {
            case "brush":
                Brush.draw(ctx, figure.x, figure.y, figure.strokeColor, figure.lineWidth);
                break;

            case "rect":
                Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color, figure.strokeColor, figure.lineWidth);
                break;

            case "circle":
                Circle.staticDraw(ctx, figure.x, figure.y, figure.r, figure.color, figure.strokeColor, figure.lineWidth);
                break;

            case "eraser":
                Eraser.draw(ctx, figure.x, figure.y, figure.color, figure.lineWidth);
                break;

            case "finish":
                ctx.beginPath();
                break;
        }
    }

    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL());
        axios.post(`http://localhost:4000/image?id=${params.id}`, {img: canvasRef.current.toDataURL()})
    }

    const connectHandler = () => {
        canvasState.setUsername(usernameRef.current.value);
        setIsModalOpen(false);
    }

    return (
        <div className="canvas">
            <Modal show={isModalOpen} onHide={() => {
            }}>
                <Modal.Header>
                    <Modal.Title>Введите ваше имя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text" className="canvas__input" ref={usernameRef}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => connectHandler()}>
                        Войти
                    </Button>
                </Modal.Footer>
            </Modal>
            <canvas onMouseDown={() => mouseDownHandler()} ref={canvasRef} width={600} height={400}/>
        </div>
    );
});

export default Canvas;