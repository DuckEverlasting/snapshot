import React, { useEffect } from "react";
import { setActiveProject ,updateProjectTabOrder } from "../actions/redux"
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";

import render from "../actions/redux/renderCanvas";

const ProjectBarSC = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  top: 1px;
  left: 6px;
  width: 100%;
  height: 30px;
  z-index: 3;
`;

const ProjectTabSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.small};
  background: ${props => props.isDragging ? "rgba(40, 40, 40, 0.9)" : "#666666"};
  color: rgb(235, 235, 235);
  height: 100%;
  padding: 0 20px;
  border-radius: ${props => props.isDragging ? "5px" : 0};
  border-bottom-right-radius: 5px;
  transition: background .2s;
  border-right: ${props => props.isDragging ? "none" : "1px solid #222222"};
  border-bottom: ${props => props.isDragging ? "none" : "1px solid #222222"};
  white-space: nowrap;
  margin-left: -5px;
  z-index: ${props => props.zIndex};

  & span {
    position: relative;
    display: block;
    padding: 0 2px 2px;

    &::after {
      position: absolute;
      content: '';
      width: ${props => props.isActiveProject ? "100%" : "0%"};
      height: 100%;
      top: 0;
      left: ${props => props.isActiveProject ? "0%" : "50%"};
      border-bottom: 1px solid ${props => props.theme.colors.highlight};
      transition: width .2s, left .2s;
    }
  }

`;


export default function ProjectBar() {  
  const activeProject = useSelector(state => state.main.activeProject),
    projects = useSelector(state => state.main.projects),
    tabOrder = useSelector(state => state.main.projectTabOrder),
    dispatch = useDispatch();

  useEffect(() => {
    console.log(tabOrder)
  }, [tabOrder]);

  useEffect(() => {
    console.log(activeProject)
  }, [activeProject]);

  const onDragEnd = result => {
    const { destination, source } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
      destination.index === source.index)
    ) {
      return;
    }
    
    dispatch(updateProjectTabOrder(source.index, destination.index))
  }

  const handleClick = async (projectId) => {
    dispatch(setActiveProject(projectId));
    return dispatch(render());
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={"projectTabsDroppable"} direction="horizontal">
        {(provided) => (
          <ProjectBarSC 
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tabOrder && tabOrder.length !== 0 &&
              tabOrder.map((projectId, i) => {
                  return (
                    <Draggable draggableId={projectId} key={projectId} index={i}>
                      {(provided, snapshot) => (
                        <ProjectTabSC
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          onClick={() => handleClick(projectId)}
                          isDragging={snapshot.isDragging}
                          isActiveProject={projectId === activeProject}
                          zIndex={tabOrder.length - i}
                        >
                          <span>{projects[projectId].present.documentSettings.documentName}</span>
                        </ProjectTabSC>
                      )}
                    </Draggable>
                  );
                })}
            {provided.placeholder}
          </ProjectBarSC>)}
      </Droppable>
    </DragDropContext>
  );
}
